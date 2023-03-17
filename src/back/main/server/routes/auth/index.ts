import type { FastifyPluginAsync } from 'fastify'
import signupRoutesHandler from './signup-routes-handler'
import tokenRoutesHandler from './token-routes-handler'

const authRoutesHandler: FastifyPluginAsync = (fastify) => {
  void fastify.register(tokenRoutesHandler, { prefix: '/token' })
  void fastify.register(signupRoutesHandler, { prefix: '/signup' })
  return Promise.resolve()
}

export default authRoutesHandler
