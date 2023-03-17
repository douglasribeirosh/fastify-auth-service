import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import nodemailer from 'nodemailer'

const signupRoutesHandler: FastifyPluginAsync = (fastify: FastifyInstance) => {
  fastify.post<{ Body: { name: string; email: string } }>('/', async (request, reply) => {
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
    void reply.status(204)
  })
  return Promise.resolve()
}

export default signupRoutesHandler
