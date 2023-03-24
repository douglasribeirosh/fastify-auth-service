import type { FastifyInstance, FastifyPluginAsync, FastifyRequest } from 'fastify'
const usersRoutesHandler: FastifyPluginAsync = (fastify: FastifyInstance) => {
  fastify.get(
    '/me',
    {
      onRequest: [fastify.authenticate],
    },
    async (request: FastifyRequest) => {
      const { log } = fastify
      const { user } = request
      log.debug({ user })
      return user
    },
  )
  return Promise.resolve()
}

export default usersRoutesHandler
