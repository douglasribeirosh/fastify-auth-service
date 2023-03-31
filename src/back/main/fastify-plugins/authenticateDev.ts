import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  preHandlerAsyncHookHandler,
} from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import { REDIS_LOGOUT_KEY_PREFIX } from '../common/constants'

const authenticateDev: preHandlerAsyncHookHandler = async function (
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { authorization } = request.headers
    const dev: { id: string; username: string; iat: number } = await request.jwtVerify()
    const { redis } = this
    const redisValue = await redis.get(`${REDIS_LOGOUT_KEY_PREFIX}${dev.id}#${authorization}`)
    if (redisValue) {
      reply.status(401)
      reply.send({ code: 401, error: 'Unauthorized' })
    }
    request.dev = dev
  } catch (err) {
    reply.send(err)
  }
}

const authenticateDevPlugin = fastifyPlugin((fastify, _options?) => {
  fastify.decorate('authenticateDev', authenticateDev)
  return Promise.resolve()
})

export { authenticateDevPlugin }
