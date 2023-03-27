import { FastifyReply } from 'fastify'
import { z } from 'zod'

const replyNotFound = (entity: string, reply: FastifyReply) => {
  const error = {
    code: 404,
    error: `${entity} not found`,
  }
  reply.code(error.code)
  return error
}

const replyRequestValidationError = (err: string | z.ZodError, reply: FastifyReply) => {
  const error = { code: 400, error: err }
  reply.code(error.code)
  return error
}

export { replyNotFound, replyRequestValidationError }
