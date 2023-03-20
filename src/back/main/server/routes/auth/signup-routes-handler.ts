import { randomUUID } from 'crypto'
import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import nodemailer from 'nodemailer'
import { z } from 'zod'

const signupRoutesHandler: FastifyPluginAsync = (fastify: FastifyInstance) => {
  fastify.post<{ Body: { name: string; email: string; username: string } }>(
    '/',
    async (request, reply) => {
      const { prisma, config } = fastify
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
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: 'password',
          username,
        },
      })
      console.log({ user })
      const info = await mailer.sendMail({
        to: `"${name}" <${email}>`,
        subject: 'Hello ✔',
        text: `POST http://localhost:${config.port}/auth/signup/confirm/${randomKey} using confirmation code ${randomCode}`,
      })
      console.log('Message sent: %s', info.messageId)
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
      const { redis } = fastify
      const redisKey = `${randomKey}#${randomCode}`
      const redisValue = `${user.id}`
      redis.setEx(redisKey, config.redisExpireSeconds, redisValue)
      void reply.status(204)
      return
    },
  )
  fastify.post<{ Params: { key: string }; Body: { code: string } }>(
    '/confirm/:key',
    async (request, reply) => {
      const BodyZ = z.object({
        code: z.string(),
      })
      const validation = BodyZ.safeParse(request.body)
      if (!validation.success) {
        reply.status(400)
        return { code: 400, error: validation.error }
      }
      const { code } = request.body
      const { key } = request.params
      const { redis } = fastify
      const redisValue = await redis.get(`${key}#${code}`)
      console.log(key, code, redisValue)
      void reply.status(204)
      return
    },
  )
  return Promise.resolve()
}

export default signupRoutesHandler
