import { FastifyPluginAsync } from 'fastify'
import confirmRoutesHandler from './confirm-routes-handler'
import loginRoutesHandler from './login-routes-handler'
import logoutRoutesHandler from './logout-routes-handler'
import registerRoutesHandler from './register-routes-handler'
import resetPassRoutesHandler from './reset-pass-routes-handler'

const domainAuthRoutesHandler: FastifyPluginAsync = (fastify) => {
  void fastify.register(loginRoutesHandler, { prefix: '/login' })
  void fastify.register(logoutRoutesHandler, { prefix: '/logout' })
  void fastify.register(registerRoutesHandler, { prefix: '/register' })
  void fastify.register(resetPassRoutesHandler, { prefix: '/reset-pass' })
  void fastify.register(confirmRoutesHandler, { prefix: '/confirm' })
  return Promise.resolve()
}

export default domainAuthRoutesHandler
