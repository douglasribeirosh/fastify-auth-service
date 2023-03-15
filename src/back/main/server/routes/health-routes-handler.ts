import type { FastifyInstance, FastifyPluginAsync } from 'fastify'

const healthRoutesHandler: FastifyPluginAsync = (fastify: FastifyInstance) => {
  fastify.get('/', async () => {
    return { web: 'HEALTHY' }
  })
  return Promise.resolve()
}

export default healthRoutesHandler
