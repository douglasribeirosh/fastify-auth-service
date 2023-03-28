import { randomUUID } from 'crypto'
import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import nodemailer from 'nodemailer'
import { z } from 'zod'
import { REDIS_CONFIRM_KEY_PREFIX, REDIS_DOMAIN_KEY_PREFIX } from '../../../../common/constants'
import { replyNotFound, replyRequestValidationError } from '../../../errors/httpErrors'

const entityName = 'User'

const PostBodyZ = z.object({
  domainId: z.string().nonempty(),
  email: z.string().email(),
})

type PostBody = z.infer<typeof PostBodyZ>

const resetPassRoutesHandler: FastifyPluginAsync = (fastify: FastifyInstance) => {
  fastify.post<{ Body: PostBody }>('/', async (request, reply) => {
    const { prisma, config, log } = fastify
    const validation = PostBodyZ.safeParse(request.body)
    if (!validation.success) {
      return replyRequestValidationError(validation.error, reply)
    }
    const { email, domainId } = request.body
    const randomCode = Math.trunc(Math.random() * 1000000).toString()
    const randomKey = randomUUID()
    const mailer = fastify.mailer
    const user = await prisma.user.findFirst({
      where: {
        domainId,
        email,
      },
    })
    if (!user) {
      return replyNotFound(entityName, reply)
    }
    const { namePrefix, name } = user
    log.debug({ user })
    const info = await mailer.sendMail({
      to: name ? `"${namePrefix ? `${namePrefix} ` : ''}${name}" <${email}>` : email,
      subject: `Hello ${namePrefix ? `${namePrefix} ` : ''}${name} ✔`,
      text: `POST http://localhost:${config.port}/api/user-auth/confirm/${randomKey} using confirmation code ${randomCode}`,
    })
    log.debug('Message sent: %s', info.messageId)
    log.debug('Preview URL: %s', nodemailer.getTestMessageUrl(info))
    const { redis } = fastify
    const redisKey = `${REDIS_DOMAIN_KEY_PREFIX}${domainId}:${REDIS_CONFIRM_KEY_PREFIX}${randomKey}#${randomCode}`
    const redisValue = `${user.id}`
    redis.setEx(redisKey, config.redisExpireSeconds, redisValue)
    void reply.status(204)
    return
  })
  return Promise.resolve()
}

export default resetPassRoutesHandler
