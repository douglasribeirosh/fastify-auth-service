import type { FastifyInstance, FastifyPluginAsync, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { replyNotFound, replyRequestValidationError } from '../../errors/httpErrors'

const entityName = 'Domain'

const domainsRoutesHandler: FastifyPluginAsync = (fastify: FastifyInstance) => {
  // Create
  fastify.post<{ Body: { name: string } }>(
    '/',
    {
      onRequest: [fastify.authenticate],
    },
    async (request: FastifyRequest<{ Body: { name: string } }>, reply) => {
      const { log, prisma } = fastify
      const { user } = request
      log.debug({ user })
      const BodyZ = z.object({
        name: z.string().nonempty(),
      })
      const validation = BodyZ.safeParse(request.body)
      if (!validation.success) {
        return replyRequestValidationError(validation.error, reply)
      }
      const { name } = request.body
      const domain = await prisma.domain.create({ data: { name, ownerId: user.id } })
      return domain
    },
  )
  // Read list
  fastify.get(
    '/',
    {
      onRequest: [fastify.authenticate],
    },
    async (request: FastifyRequest) => {
      const { log, prisma } = fastify
      const { user } = request
      log.debug({ user })
      const domains = await prisma.domain.findMany({ where: { ownerId: user.id } })
      return domains
    },
  )
  // Read by Id
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      onRequest: [fastify.authenticate],
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      const { log, prisma } = fastify
      const { user } = request
      log.debug({ user })
      const { id } = request.params
      const domain = await prisma.domain.findFirst({ where: { id, ownerId: user.id } })
      if (!domain) {
        return replyNotFound(entityName, reply)
      }
      return domain
    },
  )
  // Update patch by Id
  fastify.patch<{
    Body: { name?: string; active?: boolean }
    Params: { id: string; enable: boolean }
  }>(
    '/:id',
    {
      onRequest: [fastify.authenticate],
    },
    async (
      request: FastifyRequest<{
        Params: { id: string; enable: boolean }
        Body: { name?: string; active?: boolean }
      }>,
      reply,
    ) => {
      const { log, prisma } = fastify
      const { user } = request
      log.debug({ user })
      const { id } = request.params
      const BodyZ = z
        .object({
          name: z.string(),
          active: z.boolean(),
        })
        .partial()
        .refine(
          (obj: Record<string | number | symbol, unknown>) =>
            Object.values(obj).some((v) => v !== undefined),
          { message: 'One of the fields must be defined' },
        )
      const validation = BodyZ.safeParse(request.body)
      if (!validation.success) {
        return replyRequestValidationError(validation.error, reply)
      }
      const domain = await prisma.domain.findFirst({ where: { id, ownerId: user.id } })
      if (!domain) {
        return replyNotFound(entityName, reply)
      }
      const { name, active } = request.body
      return await prisma.domain.update({ where: { id: domain.id }, data: { ...{ name, active } } })
    },
  )
  // Delete by Id
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const { log, prisma } = fastify
      const { user } = request
      log.debug({ user })
      const { id } = request.params
      const domain = await prisma.domain.findFirst({ where: { id, ownerId: user.id } })
      if (!domain) {
        return replyNotFound(entityName, reply)
      }
      await prisma.domain.delete({ where: { id: domain.id } })
      reply.status(204)
      return
    },
  )
  return Promise.resolve()
}

export default domainsRoutesHandler
