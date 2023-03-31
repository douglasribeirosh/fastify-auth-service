import type { FastifyInstance, FastifyPluginAsync, FastifyRequest } from 'fastify'
const whoamiRoutesHandler: FastifyPluginAsync = (fastify: FastifyInstance) => {
  fastify.get(
    '/',
    {
      onRequest: [fastify.authenticate],
    },
    async (request: FastifyRequest) => {
      const { log } = fastify
      const { dev } = request
      log.debug({ dev })
      return dev
    },
  )
  return Promise.resolve()
}

export default whoamiRoutesHandler
