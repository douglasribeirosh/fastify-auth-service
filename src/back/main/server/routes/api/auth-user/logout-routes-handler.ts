import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { REDIS_DOMAIN_KEY_PREFIX, REDIS_LOGOUT_KEY_PREFIX } from '../../../../common/constants'
import { replyRequestValidationError } from '../../../errors/httpErrors'

const PostBodyZ = z.undefined()

type PostBody = z.infer<typeof PostBodyZ>

const logoutRoutesHandler: FastifyPluginAsync = (fastify: FastifyInstance) => {
  fastify.post<{ Body: PostBody }>(
    '/',
    {
      onRequest: [fastify.authenticateClient],
    },
    async (request, reply) => {
      const { log, config, redis } = fastify
      const validation = PostBodyZ.safeParse(request.body)
      if (!validation.success) {
        return replyRequestValidationError('Error when confirming password or code', reply)
      }
      const { domainId } = request.client
      const { authorization } = request.headers
      const user: { id: string } = await request.jwtVerify()
      log.debug({ user })
      const redisKey = `${REDIS_DOMAIN_KEY_PREFIX}${domainId}:${REDIS_LOGOUT_KEY_PREFIX}${user.id}#${authorization}`
      const redisValue = `${authorization}`
      redis.setEx(redisKey, config.redisExpireSeconds, redisValue)
      reply.code(204)
      return
    },
  )
  return Promise.resolve()
}

export default logoutRoutesHandler
