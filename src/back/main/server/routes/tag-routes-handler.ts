import type { FastifyInstance, FastifyPluginAsync } from 'fastify'

const tagRoutesHandler: FastifyPluginAsync = (fastify: FastifyInstance) => {
  fastify.get(
    '/',
    async () => {
        return process.env[`IMAGE_VERSION`] ?? 'latest'
    }
  )
  return Promise.resolve()
}

export default tagRoutesHandler