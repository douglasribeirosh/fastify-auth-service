import type { FastifyPluginAsync } from 'fastify'
import usersRoutesHandler from './users-routes-handler'

const apiRoutesHandler: FastifyPluginAsync = (fastify) => {
  void fastify.register(usersRoutesHandler, { prefix: '/users' })
  return Promise.resolve()
}

export default apiRoutesHandler
