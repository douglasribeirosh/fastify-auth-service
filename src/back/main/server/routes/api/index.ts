import type { FastifyPluginAsync } from 'fastify'
import domainsRoutesHandler from './domains-routes-handler'
import usersRoutesHandler from './users-routes-handler'

const apiRoutesHandler: FastifyPluginAsync = (fastify) => {
  void fastify.register(usersRoutesHandler, { prefix: '/users' })
  void fastify.register(domainsRoutesHandler, { prefix: '/domains' })
  return Promise.resolve()
}

export default apiRoutesHandler
