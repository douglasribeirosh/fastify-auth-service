import { FastifyInstance } from 'fastify/types/instance'
import { FastifyPluginAsync } from 'fastify/types/plugin'

const whoamiRoutesHandler: FastifyPluginAsync = (fastify: FastifyInstance) => {
  fastify.get(
    '/',
    {
      onRequest: [fastify.authenticateClient, fastify.authenticateUser],
    },
    async (request) => {
      const { log } = fastify
      const { client } = request
      const { authorizedUser } = request
      log.debug({ client, authorizedUser })
      return authorizedUser
    },
  )
  return Promise.resolve()
}

export default whoamiRoutesHandler
