import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { hash } from 'bcryptjs'
import { REDIS_CONFIRM_KEY_PREFIX, REDIS_DOMAIN_KEY_PREFIX } from '../../../../common/constants'
import { replyRequestValidationError } from '../../../errors/httpErrors'

const PostBodyZ = z.object({
  code: z.string(),
  password: z.string(),
  confirmPassword: z.string(),
})

type PostBody = z.infer<typeof PostBodyZ>
type ParamsType = { key: string }

const confirmRoutesHandler: FastifyPluginAsync = (fastify: FastifyInstance) => {
  fastify.post<{
    Params: ParamsType
    Body: PostBody
  }>(
    '/:key',
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
      const { password, confirmPassword } = request.body
      const { code } = request.body
      const { key } = request.params
      const { redis } = fastify
      const userId = await redis.get(
        `${REDIS_DOMAIN_KEY_PREFIX}${domainId}:${REDIS_CONFIRM_KEY_PREFIX}${key}#${code}`,
      )
      log.debug({ key, code, userId })
      if (password !== confirmPassword || !userId) {
        return replyRequestValidationError('Error when confirming password or code', reply)
      }
      const passwordHash = await hash(password, 10)
      await prisma.user.update({ where: { id: userId }, data: { passwordHash } })
      void reply.status(204)
      return
    },
  )
  return Promise.resolve()
}

export default confirmRoutesHandler
