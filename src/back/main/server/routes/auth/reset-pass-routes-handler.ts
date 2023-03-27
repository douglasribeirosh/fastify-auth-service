import { randomUUID } from 'crypto'
import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import nodemailer from 'nodemailer'
import { z } from 'zod'
import { REDIS_CONFIRM_KEY_PREFIX } from '../../../common/constants'
import { replyNotFound, replyRequestValidationError } from '../../errors/httpErrors'

const entityName = 'Dev'

const resetPassRoutesHandler: FastifyPluginAsync = (fastify: FastifyInstance) => {
  fastify.post<{ Body: { email: string } }>('/', async (request, reply) => {
    const { prisma, config, log } = fastify
    const BodyZ = z.object({
      email: z.string().email(),
    })
    const validation = BodyZ.safeParse(request.body)
    if (!validation.success) {
      return replyRequestValidationError(validation.error, reply)
    }
    const { email } = request.body
    const randomCode = Math.trunc(Math.random() * 1000000).toString()
    const randomKey = randomUUID()
    const mailer = fastify.mailer
    const dev = await prisma.dev.findFirst({
      where: {
        email,
      },
    })
    if (!dev) {
      return replyNotFound(entityName, reply)
    }
    const { name } = dev
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
  })
  return Promise.resolve()
}

export default resetPassRoutesHandler
