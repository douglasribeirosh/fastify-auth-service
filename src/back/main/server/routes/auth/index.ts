import type { FastifyPluginAsync } from 'fastify'

import tokenRoutesHandler from './token-routes-handler'

const authRoutesHandler: FastifyPluginAsync = (fastify) => {
  void fastify.register(tokenRoutesHandler, { prefix: '/token' })
  return Promise.resolve()
}

export default authRoutesHandler
