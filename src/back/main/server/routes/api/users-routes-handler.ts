import type { FastifyInstance, FastifyPluginAsync, FastifyRequest } from 'fastify'

const usersRoutesHandler: FastifyPluginAsync = (fastify: FastifyInstance) => {
  fastify.get('/me', async (request: FastifyRequest) => {
    await request.jwtVerify()
    return request.user
  })
  return Promise.resolve()
}

export default usersRoutesHandler
