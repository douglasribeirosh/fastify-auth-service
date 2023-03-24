import type { FastifyPluginAsync } from 'fastify'
import registerRoutesHandler from './register-routes-handler'
import loginRoutesHandler from './login-routes-handler'

const authRoutesHandler: FastifyPluginAsync = (fastify) => {
  void fastify.register(loginRoutesHandler, { prefix: '/login' })
  void fastify.register(registerRoutesHandler, { prefix: '/register' })
  return Promise.resolve()
}

export default authRoutesHandler
