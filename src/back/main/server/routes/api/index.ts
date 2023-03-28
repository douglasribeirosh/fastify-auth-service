import type { FastifyPluginAsync } from 'fastify'
import domainsRoutesHandler from './domains-routes-handler'
import devsRoutesHandler from './devs-routes-handler'
import domainAuthRoutesHandler from './domain-auth'

const apiRoutesHandler: FastifyPluginAsync = (fastify) => {
  void fastify.register(devsRoutesHandler, { prefix: '/devs' })
  void fastify.register(domainsRoutesHandler, { prefix: '/domains' })
  void fastify.register(domainAuthRoutesHandler, { prefix: '/domain-auth' })
  return Promise.resolve()
}

export default apiRoutesHandler
