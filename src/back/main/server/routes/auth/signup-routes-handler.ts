import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import nodemailer from 'nodemailer'
import { z } from 'zod'

const signupRoutesHandler: FastifyPluginAsync = (fastify: FastifyInstance) => {
  fastify.post<{ Body: { name: string; email: string } }>('/', async (request, reply) => {
    const { prisma } = fastify
    const BodyZ = z.object({
      name: z.string(),
      email: z.string().email(),
    })
    const validation = BodyZ.safeParse(request.body)
    if (!validation.success) {
      reply.status(400)
      return { code: 400, error: validation.error }
    }
    const { name, email } = request.body
    const randomIdentifier = Math.random()
    const mailer = fastify.mailer
    const info = await mailer.sendMail({
      to: `"${name}" <${email}>`,
      subject: 'Hello ✔',
      text: randomIdentifier.toString(),
    })
    console.log('Message sent: %s', info.messageId)
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: 'password',
        username: 'username',
      },
    })
    console.log({ user })
    void reply.status(204)
    return
  })
  return Promise.resolve()
}

export default signupRoutesHandler
