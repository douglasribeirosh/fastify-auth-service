import { randomUUID } from 'crypto'
import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import nodemailer from 'nodemailer'
import { z } from 'zod'
import { handlePrismaUserDuplicateError } from '../../errors/errorHandlers'

const signupRoutesHandler: FastifyPluginAsync = (fastify: FastifyInstance) => {
  fastify.post<{ Body: { name: string; email: string; username: string } }>(
    '/',
    async (request, reply) => {
      const { prisma, config, log } = fastify
      const BodyZ = z.object({
        name: z.string().nonempty(),
        email: z.string().email(),
        username: z.string().nonempty(),
      })
      const validation = BodyZ.safeParse(request.body)
      if (!validation.success) {
        reply.status(400)
        return { code: 400, error: validation.error }
      }
      const { name, email, username } = request.body
      const randomCode = Math.trunc(Math.random() * 1000000).toString()
      const randomKey = randomUUID()
      const mailer = fastify.mailer
      const user = await prisma.user
        .create({
          data: {
            name,
            email,
            username,
          },
        })
        .catch((err) => {
          throw handlePrismaUserDuplicateError(err, reply)
        })
      log.debug({ user })
      const info = await mailer.sendMail({
        to: `"${name}" <${email}>`,
        subject: `Hello ${name} ✔`,
        text: `POST http://localhost:${config.port}/auth/signup/confirm/${randomKey} using confirmation code ${randomCode}`,
      })
      log.debug('Message sent: %s', info.messageId)
      log.debug('Preview URL: %s', nodemailer.getTestMessageUrl(info))
      const { redis } = fastify
      const redisKey = `${randomKey}#${randomCode}`
      const redisValue = `${user.id}`
      redis.setEx(redisKey, config.redisExpireSeconds, redisValue)
      void reply.status(204)
      return
    },
  )
  fastify.post<{
    Params: { key: string }
    Body: { password: string; confirmPassword: string; code: string }
  }>('/confirm/:key', async (request, reply) => {
    const { log, prisma } = fastify
    const BodyZ = z.object({
      code: z.string(),
      password: z.string(),
      confirmPassword: z.string(),
    })
    const validation = BodyZ.safeParse(request.body)
    if (!validation.success) {
      reply.status(400)
      return { code: 400, error: validation.error }
    }
    const { password, confirmPassword } = request.body
    const { code } = request.body
    const { key } = request.params
    const { redis } = fastify
    const userId = await redis.get(`${key}#${code}`)
    log.debug({ key, code, userId })
    if (password !== confirmPassword || !userId) {
      reply.status(400)
      return { code: 400, error: 'Error when confirming password or code' }
    }
    await prisma.user.update({ where: { id: userId }, data: { password } })
    void reply.status(204)
    return
  })
  return Promise.resolve()
}

export default signupRoutesHandler
