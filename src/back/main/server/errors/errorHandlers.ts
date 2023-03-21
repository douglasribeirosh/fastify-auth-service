import { FastifyReply } from 'fastify'

const handlePrismaUserDuplicateError = (err: { code: string }, reply: FastifyReply) => {
  if (err.code === 'P2002') {
    reply.status(400)
    return { code: 400, error: 'Email or username already signed up' }
  }
  return err
}

export { handlePrismaUserDuplicateError }
