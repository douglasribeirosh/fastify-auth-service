import type { FastifyInstance, FastifyPluginAsync } from 'fastify'

const tokenRoutesHandler: FastifyPluginAsync = (fastify: FastifyInstance) => {
  fastify.post('/', async () => {
    const token = fastify.jwt.sign({ login: 'login' })
    return { token }
  })
  return Promise.resolve()
}

export default tokenRoutesHandler
