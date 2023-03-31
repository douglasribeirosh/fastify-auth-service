import { compare } from 'bcryptjs'
import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { replyRequestValidationError } from '../../../errors/httpErrors'

const PostBodyZ = z.object({
  email: z.string(),
  password: z.string(),
})

type PostBody = z.infer<typeof PostBodyZ>

const loginRoutesHandler: FastifyPluginAsync = (fastify: FastifyInstance) => {
  fastify.post<{ Body: PostBody }>(
    '/',
    {
      onRequest: [fastify.authenticateClient],
    },
    async (request, reply) => {
      const { log, prisma } = fastify
      const validation = PostBodyZ.safeParse(request.body)
      if (!validation.success) {
        return replyRequestValidationError(validation.error, reply)
      }
      const { domainId } = request.client
      const { email, password } = request.body
      const user = await prisma.user.findFirst({
        where: {
          email,
          domainId,
        },
      })
      log.debug({ user })
      if (!user || (user.passwordHash && !(await compare(password, user.passwordHash)))) {
        reply.status(401)
        log.debug('Unauthorized', request.body)
        return { code: 401, error: 'Unauthorized' }
      }
      const token = fastify.jwt.sign({ id: user.id, nickname: user.nickname })
      return { token }
    },
  )
  return Promise.resolve()
}

export default loginRoutesHandler
