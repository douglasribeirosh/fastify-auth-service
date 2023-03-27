import { randomUUID } from 'crypto'
import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import nodemailer from 'nodemailer'
import { z } from 'zod'
import { handlePrismaUserDuplicateError } from '../../errors/errorHandlers'
import { hash } from 'bcryptjs'
import { REDIS_REGISTER_KEY_PREFIX } from '../../../common/constants'

const registerRoutesHandler: FastifyPluginAsync = (fastify: FastifyInstance) => {
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
        text: `POST http://localhost:${config.port}/auth/confirm/${randomKey} using confirmation code ${randomCode}`,
      })
      log.debug('Message sent: %s', info.messageId)
      log.debug('Preview URL: %s', nodemailer.getTestMessageUrl(info))
      const { redis } = fastify
      const redisKey = `${REDIS_REGISTER_KEY_PREFIX}${randomKey}#${randomCode}`
      const redisValue = `${user.id}`
      redis.setEx(redisKey, config.redisExpireSeconds, redisValue)
      void reply.status(204)
      return
    },
  )
  return Promise.resolve()
}

export default registerRoutesHandler
