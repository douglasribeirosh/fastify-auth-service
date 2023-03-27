import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { REDIS_LOGOUT_KEY_PREFIX } from '../../../common/constants'
import { replyRequestValidationError } from '../../errors/httpErrors'

const logoutRoutesHandler: FastifyPluginAsync = (fastify: FastifyInstance) => {
  fastify.post<{ Body: undefined }>('/', async (request, reply) => {
    const { log, config, redis } = fastify
    const BodyZ = z.undefined()
    const validation = BodyZ.safeParse(request.body)
    if (!validation.success) {
      return replyRequestValidationError('Error when confirming password or code', reply)
    }
    const { authorization } = request.headers
    await request.jwtVerify()
    const { user } = request
    log.debug({ user })
    const redisKey = `${REDIS_LOGOUT_KEY_PREFIX}${user.id}#${authorization}`
    const redisValue = `${authorization}`
    redis.setEx(redisKey, config.redisExpireSeconds, redisValue)
    reply.code(204)
    return
  })
  return Promise.resolve()
}

export default logoutRoutesHandler
