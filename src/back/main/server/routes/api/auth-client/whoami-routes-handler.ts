import { FastifyInstance } from 'fastify/types/instance'
import { FastifyPluginAsync } from 'fastify/types/plugin'

const whoamiRoutesHandler: FastifyPluginAsync = (fastify: FastifyInstance) => {
  fastify.get(
    '/',
    {
      onRequest: [fastify.authenticateClient],
    },
    async (request) => {
      const { log } = fastify
      const { client } = request
      log.debug({ client })
      return client
    },
  )
  return Promise.resolve()
}

export default whoamiRoutesHandler
