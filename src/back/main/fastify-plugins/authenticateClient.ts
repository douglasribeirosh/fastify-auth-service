import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  preHandlerAsyncHookHandler,
} from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import { REDIS_LOGOUT_KEY_PREFIX } from '../common/constants'
import { replyUnauthorizedError } from '../server/errors/httpErrors'

const authenticateClient: preHandlerAsyncHookHandler = async function (
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { authorizationclient } = request.headers
    let authorizationClientValue = Array.isArray(authorizationclient)
      ? authorizationclient[0]
      : authorizationclient
    if (!authorizationClientValue || !authorizationClientValue.startsWith('Bearer ')) {
      replyUnauthorizedError(reply)
      return
    }
    authorizationClientValue = authorizationClientValue.replace('Bearer ', '')
    const client: { id: string; domainId: string } | null = await this.jwt.decode(
      authorizationClientValue,
    )
    if (!client) {
      replyUnauthorizedError(reply)
      return
    }
    // TODO: Add client token to blacklist when deleting token
    // const { redis } = this
    // const redisValue = await redis.get(`${REDIS_LOGOUT_KEY_PREFIX}${dev.id}#${authorization}`)
    // if (redisValue) {
    //   reply.status(401)
    //   reply.send({ code: 401, error: 'Unauthorized' })
    // }
    request.client = client
  } catch (err) {
    reply.send(err)
  }
}

const authenticateClientPlugin = fastifyPlugin((fastify, _options?) => {
  fastify.decorate('authenticateClient', authenticateClient)
  return Promise.resolve()
})

export { authenticateClientPlugin }
