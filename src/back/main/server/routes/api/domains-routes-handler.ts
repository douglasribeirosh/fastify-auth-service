import { Domain } from '.prisma/client'
import type { FastifyInstance, FastifyPluginAsync, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { DomainParamsWithId } from '../../../types/server/routes/api/domains-routes-handler'
import { replyNotFound, replyRequestValidationError } from '../../errors/httpErrors'

const entityName = 'Domain'

const DomainPostBodyZ = z.object({
  name: z.string().nonempty(),
})

const DomainPatchBodyZ = z
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

type DomainPostBody = z.infer<typeof DomainPostBodyZ>
type DomainPatchBody = z.infer<typeof DomainPatchBodyZ>

const domainsRoutesHandler: FastifyPluginAsync = (fastify: FastifyInstance) => {
  // Create
  fastify.post<{ Body: DomainPostBody }>(
    '/',
    {
      onRequest: [fastify.authenticate],
    },
    async (request: FastifyRequest<{ Body: DomainPostBody }>, reply) => {
      const { log, prisma } = fastify
      const { user } = request
      log.debug({ user })
      const BodyZ = DomainPostBodyZ
      const validation = BodyZ.safeParse(request.body)
      if (!validation.success) {
        return replyRequestValidationError(validation.error, reply)
      }
      const { name } = request.body
      const domain: Domain = await prisma.domain.create({ data: { name, ownerId: user.id } })
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
  fastify.get<{ Params: DomainParamsWithId }>(
    '/:id',
    {
      onRequest: [fastify.authenticate],
    },
    async (request: FastifyRequest<{ Params: DomainParamsWithId }>, reply) => {
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
    Body: DomainPatchBody
    Params: DomainParamsWithId
  }>(
    '/:id',
    {
      onRequest: [fastify.authenticate],
    },
    async (
      request: FastifyRequest<{
        Params: DomainParamsWithId
        Body: DomainPatchBody
      }>,
      reply,
    ) => {
      const { log, prisma } = fastify
      const { user } = request
      log.debug({ user })
      const { id } = request.params
      const BodyZ = DomainPatchBodyZ
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
  fastify.delete<{ Params: DomainParamsWithId }>(
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
