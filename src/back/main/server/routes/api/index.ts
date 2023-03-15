import type { FastifyPluginAsync } from 'fastify'
import usersRoutesHandler from './users-routes-handler'

const apiRoutesHandler: FastifyPluginAsync = (fastify) => {
  if (fastify.verifyJWT) {
    fastify.addHook('onRequest', fastify.verifyJWT)
  }
  void fastify.register(usersRoutesHandler, { prefix: '/users' })
  return Promise.resolve()
}

export default apiRoutesHandler
