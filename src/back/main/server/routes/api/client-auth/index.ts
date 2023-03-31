import { FastifyPluginAsync } from 'fastify'
import loginRoutesHandler from './login-routes-handler'
import whoamiRoutesHandler from './whoami-routes-handler'

const clientAuthRoutesHandler: FastifyPluginAsync = (fastify) => {
  void fastify.register(loginRoutesHandler, { prefix: '/login' })
  void fastify.register(whoamiRoutesHandler, { prefix: '/whoami' })
  return Promise.resolve()
}

export default clientAuthRoutesHandler
