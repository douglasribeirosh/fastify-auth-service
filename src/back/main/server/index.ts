import fastify from 'fastify'
import { Config } from '../types/config'
import { ServerT } from '../types/server'
import jwt from '@fastify/jwt'
import routesHandler from './routes'
import { buildMailer } from '../mailer'
import { Mailer } from '../types/mailer'
import { Prisma, PrismaClient } from '@prisma/client'
import { createClient } from 'redis'
import { RedisClientType } from 'redis'

declare module 'fastify' {
  export interface FastifyInstance {
    config: Config
    mailer: Mailer
    prisma: PrismaClient<
      Prisma.PrismaClientOptions,
      never,
      Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
    >
    redis: RedisClientType
  }
}

const buildServer = async (config: Config) => {
  const redis = createClient({ url: config.redisUrl })
  redis.on('error', (err) => console.log('Redis Client Error', err))
  await redis.connect()
  const fastifyServer = fastify({ logger: { level: config.logLevel } })
  fastifyServer.decorate('config', config)
  fastifyServer.decorate('mailer', await buildMailer(config))
  fastifyServer.decorate('redis', redis)
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
  await fastifyServer.redis.disconnect()
  await fastifyServer.close()
}

export { buildServer, startServer, stopServer }
