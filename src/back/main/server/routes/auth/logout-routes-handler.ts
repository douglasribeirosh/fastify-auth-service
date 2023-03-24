import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { REDIS_LOGOUT_KEY_PREFIX } from '../../../common/constants'

const logoutRoutesHandler: FastifyPluginAsync = (fastify: FastifyInstance) => {
  fastify.post<{ Body: undefined }>('/', async (request, reply) => {
    const { log, config, redis } = fastify
    const BodyZ = z.undefined()
    const validation = BodyZ.safeParse(request.body)
    if (!validation.success) {
      reply.status(400)
      return { code: 400, error: validation.error }
    }
    const { authorization } = request.headers
    const user = (await request.jwtVerify()) as { id: string }
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
