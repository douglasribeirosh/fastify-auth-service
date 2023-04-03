import { Client } from '.prisma/client'
import type { FastifyInstance, FastifyPluginAsync, FastifyRequest } from 'fastify'
import { z } from 'zod'
import {
  REDIS_CLIENT_KEY_PREFIX,
  REDIS_DOMAIN_KEY_PREFIX,
  REDIS_LOGOUT_KEY_PREFIX,
} from '../../../../common/constants'
import {
  ClientParamsWithDomainId,
  ClientParamsWithId,
} from '../../../../types/server/routes/api/domains/clients-routes-handler'
import {
  replyNotFound,
  replyRequestValidationError,
  replyUnauthorizedError,
} from '../../../errors/httpErrors'

const entityName = 'Client'

const ClientPostBodyZ = z.object({ name: z.string().nonempty() }).strict()

type ClientPostBody = z.infer<typeof ClientPostBodyZ>

const clientsRoutesHandler: FastifyPluginAsync = (fastify: FastifyInstance) => {
  // Create
  fastify.post<{ Params: ClientParamsWithDomainId; Body: ClientPostBody }>(
    '/',
    {
      onRequest: [fastify.authenticateDev],
    },
    async (
      request: FastifyRequest<{ Params: ClientParamsWithDomainId; Body: ClientPostBody }>,
      reply,
    ) => {
      const { log, prisma } = fastify
      const { dev } = request
      log.debug({ dev })
      const BodyZ = ClientPostBodyZ
      const validation = BodyZ.safeParse(request.body)
      if (!validation.success) {
        return replyRequestValidationError(validation.error, reply)
      }
      const { domainId } = request.params
      const { name } = request.body
      const domain = await prisma.domain.findFirst({ where: { id: domainId, ownerId: dev.id } })
      if (!domain) {
        return replyUnauthorizedError(reply)
      }
      const client: Client = await prisma.client.create({ data: { domainId, name } })
      return client
    },
  )
  // Read list
  fastify.get<{ Params: ClientParamsWithDomainId }>(
    '/',
    {
      onRequest: [fastify.authenticateDev],
    },
    async (request, reply) => {
      const { log, prisma } = fastify
      const { dev } = request
      log.debug({ dev })
      const { domainId } = request.params
      const domain = await prisma.domain.findFirst({ where: { id: domainId, ownerId: dev.id } })
      if (!domain) {
        return replyUnauthorizedError(reply)
      }
      const clients = await prisma.client.findMany({ where: { domainId: domain.id } })
      return clients
    },
  )
  // Read by Id
  fastify.get<{ Params: ClientParamsWithId }>(
    '/:id',
    {
      onRequest: [fastify.authenticateDev],
    },
    async (request: FastifyRequest<{ Params: ClientParamsWithId }>, reply) => {
      const { log, prisma } = fastify
      const { dev } = request
      log.debug({ dev })
      const { id, domainId } = request.params
      const domain = await prisma.domain.findFirst({ where: { id: domainId, ownerId: dev.id } })
      if (!domain) {
        return replyUnauthorizedError(reply)
      }
      const client = await prisma.client.findFirst({ where: { id, domainId: domain.id } })
      if (!client) {
        return replyNotFound(entityName, reply)
      }
      return client
    },
  )
  // Delete by Id
  fastify.delete<{ Params: ClientParamsWithId }>(
    '/:id',
    {
      onRequest: [fastify.authenticateDev],
    },
    async (request, reply) => {
      const { log, prisma, redis, config } = fastify
      const { dev } = request
      log.debug({ dev })
      const { id, domainId } = request.params
      const domain = await prisma.domain.findFirst({ where: { id: domainId, ownerId: dev.id } })
      if (!domain) {
        return replyUnauthorizedError(reply)
      }
      const client = await prisma.client.findFirst({ where: { id, domainId: domain.id } })
      if (!client) {
        return replyNotFound(entityName, reply)
      }
      await prisma.client.delete({ where: { id: client.id } })
      const redisKey = `${REDIS_LOGOUT_KEY_PREFIX}${REDIS_DOMAIN_KEY_PREFIX}${client.domainId}:${REDIS_CLIENT_KEY_PREFIX}${client.id}`
      const redisValue = `${client.id}`
      redis.setEx(redisKey, config.redisExpireSeconds, redisValue)
      reply.status(204)
      return
    },
  )
  return Promise.resolve()
}

export default clientsRoutesHandler
