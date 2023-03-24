import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'
import { REDIS_LOGOUT_KEY_PREFIX } from '../../../common/constants'

const usersRoutesHandler: FastifyPluginAsync = (fastify: FastifyInstance) => {
  fastify.get('/me', async (request: FastifyRequest, reply: FastifyReply) => {
    const { log, redis } = fastify
    const decoded = await request.jwtVerify()
    log.debug({ decoded })
    const user = request.user as { id: string }
    log.debug({ user })
    const { authorization } = request.headers
    const redisValue = await redis.get(`${REDIS_LOGOUT_KEY_PREFIX}${user.id}#${authorization}`)
    if (redisValue) {
      reply.status(401)
      return { code: 401, error: 'Unauthorized' }
    }
    return request.user
  })
  return Promise.resolve()
}

export default usersRoutesHandler
