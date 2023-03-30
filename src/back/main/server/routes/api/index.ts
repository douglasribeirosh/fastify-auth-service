import type { FastifyPluginAsync } from 'fastify'
import domainsRoutesHandler from './domains-routes-handler'
import devsRoutesHandler from './devs-routes-handler'
import domainAuthRoutesHandler from './domain-auth'
import clientsRoutesHandler from './domains/clients-routes-handler'
import clientAuthRoutesHandler from './client-auth'

const apiRoutesHandler: FastifyPluginAsync = (fastify) => {
  void fastify.register(devsRoutesHandler, { prefix: '/devs' })
  void fastify.register(domainsRoutesHandler, { prefix: '/domains' })
  void fastify.register(clientsRoutesHandler, { prefix: '/domains/:domainId/clients' })
  void fastify.register(clientAuthRoutesHandler, { prefix: '/client-auth' })
  void fastify.register(domainAuthRoutesHandler, { prefix: '/domain-auth' })
  return Promise.resolve()
}

export default apiRoutesHandler
