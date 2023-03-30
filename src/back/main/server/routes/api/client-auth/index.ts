import { FastifyPluginAsync } from 'fastify'
import loginRoutesHandler from './login-routes-handler'

const clientAuthRoutesHandler: FastifyPluginAsync = (fastify) => {
  void fastify.register(loginRoutesHandler, { prefix: '/login' })
  return Promise.resolve()
}

export default clientAuthRoutesHandler
