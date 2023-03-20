import fastify from 'fastify'
import { Config } from '../types/config'
import { ServerT } from '../types/server'
import jwt from '@fastify/jwt'
import routesHandler from './routes'
import { buildMailer } from '../mailer'
import { Mailer } from '../types/mailer'
import { Prisma, PrismaClient } from '@prisma/client'

declare module 'fastify' {
  export interface FastifyInstance {
    config: Config
    mailer: Mailer
    prisma: PrismaClient<
      Prisma.PrismaClientOptions,
      never,
      Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
    >
  }
}

const buildServer = async (config: Config) => {
  const fastifyServer = fastify({ logger: { level: config.logLevel } })
  fastifyServer.decorate('config', config)
  fastifyServer.decorate('mailer', await buildMailer(config))
  fastifyServer.register(jwt, {
    secret: config.jwtSecret,
  })
  return { fastifyServer }
}

const startServer = async (server: ServerT) => {
  const { fastifyServer } = server
  const prisma = new PrismaClient()
  fastifyServer.decorate('prisma', prisma)
  const { config } = fastifyServer
  console.log({ config })
  fastifyServer.register(routesHandler)
  const { host, port } = config
  await fastifyServer.listen({ host, port })
  console.log(`Listening on ${host}:${port}`)
}

const stopServer = async (server: ServerT) => {
  const { fastifyServer } = server
  console.debug('Closing')
  await fastifyServer.prisma.$disconnect()
  await fastifyServer.close()
}

export { buildServer, startServer, stopServer }
