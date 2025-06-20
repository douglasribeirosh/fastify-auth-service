import { compare } from 'bcryptjs'
import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { replyRequestValidationError } from '../../errors/httpErrors'

const loginRoutesHandler: FastifyPluginAsync = (fastify: FastifyInstance) => {
  fastify.post<{ Body: { username: string; password: string } }>('/', async (request, reply) => {
    const { log, prisma } = fastify
    const BodyZ = z.object({
      username: z.string(),
      password: z.string(),
    })
    const validation = BodyZ.safeParse(request.body)
    if (!validation.success) {
      return replyRequestValidationError(validation.error, reply)
    }
    const { username, password } = request.body
    const dev = await prisma.dev.findFirst({
      where: {
        username,
      },
    })
    log.debug({ dev })
    if (!dev || (dev.passwordHash && !(await compare(password, dev.passwordHash)))) {
      reply.status(401)
      log.debug('Unauthorized', request.body)
      return { code: 401, error: 'Unauthorized' }
    }
    const token = fastify.jwt.sign({ id: dev.id, username })
    return { token }
  })
  return Promise.resolve()
}

export default loginRoutesHandler
