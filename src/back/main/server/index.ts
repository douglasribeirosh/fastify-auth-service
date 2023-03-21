import fastify, { FastifyBaseLogger } from 'fastify'
import { Config } from '../types/config'
import { FastifyT, ServerT } from '../types/server'
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

const onRedisError = (log: FastifyBaseLogger) => (err: Error) => {
  log.error('Redis Client Error', err)
}

const buildServer = async (config: Config) => {
  const redis = createClient({ url: config.redisUrl })
  await redis.connect()
  const fastifyServer = fastify({
    logger: {
      level: config.logLevel,
      transport: {
        options: {
          ignore: 'pid,hostname,reqId,responseTime,req,res',
          translateTime: true,
        },
        target: 'pino-pretty',
      },
    },
  })
  redis.on('error', onRedisError(fastifyServer))
  fastifyServer.decorate('config', config)
  fastifyServer.decorate('mailer', await buildMailer(config))
  fastifyServer.decorate('redis', redis)
  fastifyServer.register(jwt, {
    secret: config.jwtSecret,
  })
  return { fastifyServer }
}

const onFastifyError = (fastifyServer: FastifyT) => (err: Error) => {
  const { log } = fastifyServer
  if (err) {
    log.error(err)
    return
  }
  log.trace('*** Fastify registered plugins:')
  log.trace(fastifyServer.printPlugins())
  log.trace('*** Registered routes:')
  log.trace(fastifyServer.printRoutes())
}

const startServer = async (server: ServerT) => {
  const { fastifyServer } = server
  const prisma = new PrismaClient()
  fastifyServer.decorate('prisma', prisma)
  const { config } = fastifyServer
  console.log({ config })
  fastifyServer.register(routesHandler)
  const { host, port } = config
  fastifyServer.ready(onFastifyError(fastifyServer))
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

export { buildServer, startServer, stopServer, onRedisError, onFastifyError }
