import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { hash } from 'bcryptjs'
import { REDIS_CONFIRM_KEY_PREFIX } from '../../../common/constants'

const confirmRoutesHandler: FastifyPluginAsync = (fastify: FastifyInstance) => {
  fastify.post<{
    Params: { key: string }
    Body: { password: string; confirmPassword: string; code: string }
  }>('/:key', async (request, reply) => {
    const { log, prisma } = fastify
    const BodyZ = z.object({
      code: z.string(),
      password: z.string(),
      confirmPassword: z.string(),
    })
    const validation = BodyZ.safeParse(request.body)
    if (!validation.success) {
      reply.status(400)
      return { code: 400, error: validation.error }
    }
    const { password, confirmPassword } = request.body
    const { code } = request.body
    const { key } = request.params
    const { redis } = fastify
    const userId = await redis.get(`${REDIS_CONFIRM_KEY_PREFIX}${key}#${code}`)
    log.debug({ key, code, userId })
    if (password !== confirmPassword || !userId) {
      reply.status(400)
      return { code: 400, error: 'Error when confirming password or code' }
    }
    const passwordHash = await hash(password, 10)
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } })
    void reply.status(204)
    return
  })
  return Promise.resolve()
}

export default confirmRoutesHandler
