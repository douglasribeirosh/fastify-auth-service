import { FastifyPluginAsync } from 'fastify'
import confirmRoutesHandler from './confirm-routes-handler'
import loginRoutesHandler from './login-routes-handler'
import logoutRoutesHandler from './logout-routes-handler'
import registerRoutesHandler from './register-routes-handler'
import resetPassRoutesHandler from './reset-pass-routes-handler'
import whoamiRoutesHandler from './whoami-routes-handler'

const authUserRoutesHandler: FastifyPluginAsync = (fastify) => {
  void fastify.register(loginRoutesHandler, { prefix: '/login' })
  void fastify.register(logoutRoutesHandler, { prefix: '/logout' })
  void fastify.register(registerRoutesHandler, { prefix: '/register' })
  void fastify.register(resetPassRoutesHandler, { prefix: '/reset-pass' })
  void fastify.register(confirmRoutesHandler, { prefix: '/confirm' })
  void fastify.register(whoamiRoutesHandler, { prefix: '/whoami' })
  return Promise.resolve()
}

export default authUserRoutesHandler
