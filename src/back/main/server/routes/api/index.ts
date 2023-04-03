import type { FastifyPluginAsync } from 'fastify'
import domainsRoutesHandler from './domains-routes-handler'
import authUserRoutesHandler from './auth-user'
import clientsRoutesHandler from './domains/clients-routes-handler'
import authClientRoutesHandler from './auth-client'

const apiRoutesHandler: FastifyPluginAsync = (fastify) => {
  void fastify.register(domainsRoutesHandler, { prefix: '/domains' })
  void fastify.register(clientsRoutesHandler, { prefix: '/domains/:domainId/clients' })
  void fastify.register(authClientRoutesHandler, { prefix: '/auth-client' })
  void fastify.register(authUserRoutesHandler, { prefix: '/auth-user' })
  return Promise.resolve()
}

export default apiRoutesHandler
