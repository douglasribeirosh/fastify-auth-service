import type { FastifyPluginAsync } from 'fastify'
import apiRoutesHandler from './api'
import authRoutesHandler from './auth'
import healthRoutesHandler from './health-routes-handler'
import tagRoutesHandler from './tag-routes-handler'

const routesHandler: FastifyPluginAsync = (fastify) => {
  void fastify.register(healthRoutesHandler, { prefix: '/health' })
  void fastify.register(tagRoutesHandler, { prefix: '/tag' })
  void fastify.register(apiRoutesHandler, { prefix: '/api' })
  void fastify.register(authRoutesHandler, { prefix: '/auth' })
  return Promise.resolve()
}

export default routesHandler
