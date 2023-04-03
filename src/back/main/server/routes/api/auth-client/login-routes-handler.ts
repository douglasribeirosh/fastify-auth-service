import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { replyRequestValidationError } from '../../../errors/httpErrors'

const PostBodyZ = z.object({
  domainId: z.string().nonempty(),
  id: z.string(),
  secret: z.string(),
})

type PostBody = z.infer<typeof PostBodyZ>

const loginRoutesHandler: FastifyPluginAsync = (fastify: FastifyInstance) => {
  fastify.post<{ Body: PostBody }>('/', async (request, reply) => {
    const { log, prisma } = fastify
    const validation = PostBodyZ.safeParse(request.body)
    if (!validation.success) {
      return replyRequestValidationError(validation.error, reply)
    }
    const { id, secret, domainId } = request.body
    const client = await prisma.client.findFirst({
      where: {
        id,
        domainId,
      },
    })
    log.debug({ client })
    if (!client || (client.secret && secret !== client.secret)) {
      reply.status(401)
      log.debug('Unauthorized', request.body)
      return { code: 401, error: 'Unauthorized' }
    }
    const token = fastify.jwt.sign({ id: client.id, domainId })
    return { token }
  })
  return Promise.resolve()
}

export default loginRoutesHandler
