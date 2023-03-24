import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  preHandlerAsyncHookHandler,
} from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import { REDIS_LOGOUT_KEY_PREFIX } from '../common/constants'

const authenticate: preHandlerAsyncHookHandler = async function (
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.send(err)
  }
  const { user } = request
  const { authorization } = request.headers
  const { redis } = this
  const redisValue = await redis.get(`${REDIS_LOGOUT_KEY_PREFIX}${user.id}#${authorization}`)
  if (redisValue) {
    reply.status(401)
    reply.send({ code: 401, error: 'Unauthorized' })
  }
}

const authenticatePlugin = fastifyPlugin((fastify, _options?) => {
  fastify.decorate('authenticate', authenticate)
  return Promise.resolve()
})

export { authenticatePlugin }
