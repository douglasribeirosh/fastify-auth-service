import type { FastifyPluginAsync } from 'fastify'
import domainsRoutesHandler from './domains-routes-handler'
import devsRoutesHandler from './devs-routes-handler'

const apiRoutesHandler: FastifyPluginAsync = (fastify) => {
  void fastify.register(devsRoutesHandler, { prefix: '/devs' })
  void fastify.register(domainsRoutesHandler, { prefix: '/domains' })
  return Promise.resolve()
}

export default apiRoutesHandler
