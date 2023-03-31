import { JWT } from '@fastify/jwt'
import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  preHandlerAsyncHookHandler,
} from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import {
  REDIS_CLIENT_KEY_PREFIX,
  REDIS_DOMAIN_KEY_PREFIX,
  REDIS_LOGOUT_KEY_PREFIX,
} from '../common/constants'
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
    const { redis } = this
    const redisValue = await redis.get(
      `${REDIS_LOGOUT_KEY_PREFIX}${REDIS_DOMAIN_KEY_PREFIX}${client.domainId}:${REDIS_CLIENT_KEY_PREFIX}${client.id}`,
    )
    if (redisValue) {
      replyUnauthorizedError(reply)
      return
    }
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
