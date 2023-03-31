import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  preHandlerAsyncHookHandler,
} from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import { REDIS_DOMAIN_KEY_PREFIX, REDIS_LOGOUT_KEY_PREFIX } from '../common/constants'

const authenticateUser: preHandlerAsyncHookHandler = async function (
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { domainId } = request.client
    const { authorization } = request.headers
    const user: { id: string; nickname: string; iat: number } = await request.jwtVerify()
    const { redis } = this
    const redisValue = await redis.get(
      `${REDIS_DOMAIN_KEY_PREFIX}${domainId}:${REDIS_LOGOUT_KEY_PREFIX}${user.id}#${authorization}`,
    )
    if (redisValue) {
      reply.status(401)
      reply.send({ code: 401, error: 'Unauthorized' })
    }
    request.authorizedUser = user
  } catch (err) {
    reply.send(err)
  }
}

const authenticateUserPlugin = fastifyPlugin((fastify, _options?) => {
  fastify.decorate('authenticateUser', authenticateUser)
  return Promise.resolve()
})

export { authenticateUserPlugin }
