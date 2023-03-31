import { JWT } from '@fastify/jwt'
import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  preHandlerAsyncHookHandler,
} from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import { REDIS_LOGOUT_KEY_PREFIX } from '../common/constants'
import { replyUnauthorizedError } from '../server/errors/httpErrors'

const decode = async (token: string, jwt: JWT, reply: FastifyReply) => {
  const decoded: { id: string; domainId: string } | null = await jwt.decode(
    token.replace('Bearer ', ''),
  )
  if (!decoded) {
    throw await replyUnauthorizedError(reply)
  }
  return decoded
}

const authenticateClient: preHandlerAsyncHookHandler = async function (
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { authorizationclient } = request.headers as { authorizationclient: string | undefined }
    if (!authorizationclient || !authorizationclient.startsWith('Bearer ')) {
      replyUnauthorizedError(reply)
      return
    }
    const client: { id: string; domainId: string } = await decode(
      authorizationclient.replace('Bearer ', ''),
      this.jwt,
      reply,
    )
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

export { authenticateClientPlugin, decode }
