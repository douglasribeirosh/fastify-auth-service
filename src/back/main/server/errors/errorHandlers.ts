import { FastifyReply } from 'fastify'
import { replyRequestValidationError } from './httpErrors'

const handlePrismaDevDuplicateError = (err: { code: string }, reply: FastifyReply) => {
  if (err.code === 'P2002') {
    return replyRequestValidationError('Email or username already signed up', reply)
  }
  return err
}

export { handlePrismaDevDuplicateError }
