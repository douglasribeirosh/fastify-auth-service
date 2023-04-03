import { randomUUID } from 'crypto'
import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import nodemailer from 'nodemailer'
import { z } from 'zod'
import { handlePrismaDevDuplicateError } from '../../errors/errorHandlers'
import { REDIS_CONFIRM_KEY_PREFIX } from '../../../common/constants'
import { replyRequestValidationError } from '../../errors/httpErrors'
import { refineZodUsername } from '../../../utils/string-validation'

const registerRoutesHandler: FastifyPluginAsync = (fastify: FastifyInstance) => {
  fastify.post<{ Body: { name: string; email: string; username: string } }>(
    '/',
    async (request, reply) => {
      const { prisma, config, log } = fastify
      const BodyZ = z.object({
        name: z.string().nonempty(),
        email: z.string().email(),
        username: refineZodUsername(z.string()),
      })
      const validation = BodyZ.safeParse(request.body)
      if (!validation.success) {
        return replyRequestValidationError(validation.error, reply)
      }
      const { name, email, username } = request.body
      const randomCode = Math.trunc(Math.random() * 1000000).toString()
      const randomKey = randomUUID()
      const mailer = fastify.mailer
      const dev = await prisma.dev
        .create({
          data: {
            name,
            email,
            username,
          },
        })
        .catch((err) => {
          throw handlePrismaDevDuplicateError(err, reply)
        })
      log.debug({ dev })
      const info = await mailer.sendMail({
        to: `"${name}" <${email}>`,
        subject: `Hello ${name} ✔`,
        text: `POST http://localhost:${config.port}/auth/confirm/${randomKey} using confirmation code ${randomCode}`,
      })
      log.debug('Message sent: %s', info.messageId)
      log.debug('Preview URL: %s', nodemailer.getTestMessageUrl(info))
      const { redis } = fastify
      const redisKey = `${REDIS_CONFIRM_KEY_PREFIX}${randomKey}#${randomCode}`
      const redisValue = `${dev.id}`
      redis.setEx(redisKey, config.redisExpireSeconds, redisValue)
      void reply.status(204)
      return
    },
  )
  return Promise.resolve()
}

export default registerRoutesHandler
