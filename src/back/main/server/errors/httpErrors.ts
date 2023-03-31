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

const replyUnauthorizedError = async (reply: FastifyReply) => {
  const error = { code: 401, error: 'Unauthorized' }
  reply.code(error.code)
  await reply.send(error)
}

export { replyNotFound, replyRequestValidationError, replyUnauthorizedError }
