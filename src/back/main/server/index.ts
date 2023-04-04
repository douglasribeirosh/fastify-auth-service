import fastify, { FastifyBaseLogger, onRequestHookHandler } from 'fastify'
import { Config } from '../types/config'
import { FastifyT, ServerT } from '../types/server'
import jwt from '@fastify/jwt'
import routesHandler from './routes'
import { buildMailer } from '../mailer'
import { Mailer } from '../types/mailer'
import { Prisma, PrismaClient } from '@prisma/client'
import { createClient } from 'redis'
import { RedisClientType } from 'redis'
import { authenticateDevPlugin } from '../fastify-plugins/authenticateDev'
import { authenticateClientPlugin } from '../fastify-plugins/authenticateClient'
import { authenticateUserPlugin } from '../fastify-plugins/authenticateUser'
import { hash } from 'bcryptjs'

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
    authenticateDev: onRequestHookHandler
    authenticateClient: onRequestHookHandler
    authenticateUser: onRequestHookHandler
  }
  export interface FastifyRequest {
    dev: { id: string; username: string }
    client: { id: string; domainId: string }
    authorizedUser: { id: string; nickname: string }
  }
}

declare module '@fastify/jwt' {
  export interface FastifyJWT {
    user: { id: string; username: string }
  }
}

const insertAndWarnDevInitialData = async (fastifyServer: FastifyT) => {
  const { prisma, log } = fastifyServer
  const password = 'dev'
  const username = 'dev'
  const passwordHash = await hash(password, 10)
  const devData = { name: 'Dev', email: 'dev@dev.com', username, passwordHash }
  const dev = await prisma.dev.upsert({
    where: { username },
    create: devData,
    update: devData,
  })
  const domainData = {
    name: 'domain.dev',
    ownerId: dev.id,
  }
  const domain = await prisma.domain.upsert({
    where: { name_ownerId: domainData },
    create: domainData,
    update: {},
  })
  const clientData = {
    name: 'client.dev',
    domainId: domain.id,
  }
  const client = await prisma.client.upsert({
    where: { name_domainId: clientData },
    create: clientData,
    update: {},
  })
  const userPassword = 'user'
  const userPasswordHash = await hash(userPassword, 10)
  const userData = {
    email: 'user@domain.dev',
    nickname: 'kitty',
    namePrefix: 'Mme.',
    name: 'Name Less',
    passwordHash: userPasswordHash,
  }
  const user = await prisma.user.upsert({
    where: { email_domainId: { email: userData.email, domainId: domain.id } },
    create: { ...userData, domainId: domain.id },
    update: userData,
  })
  log.warn('*** Running for development purposes. Initial Data:')
  log.warn('***************************************************')
  log.warn({
    dev: { ...dev, password },
    domain,
    client,
    user: { ...user, password: userPassword },
  })
  log.warn('***************************************************')
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
  redis.on('error', onRedisError(fastifyServer.log))
  fastifyServer.decorate('config', config)
  fastifyServer.decorate('mailer', await buildMailer(config))
  fastifyServer.decorate('redis', redis)
  const dev: { id: string; username: string; iat: number } | undefined = undefined
  fastifyServer.decorateRequest('dev', dev)
  fastifyServer.register(jwt, {
    secret: config.jwtSecret,
  })
  fastifyServer.register(authenticateDevPlugin)
  fastifyServer.register(authenticateClientPlugin)
  fastifyServer.register(authenticateUserPlugin)
  return { fastifyServer }
}

const onFastifyReady = (fastifyServer: FastifyT) => (err: Error) => {
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
  const { config, log } = fastifyServer
  console.log({ config })
  const prisma = new PrismaClient()
  fastifyServer.decorate('prisma', prisma)
  fastifyServer.register(routesHandler)
  const { host, port } = config
  fastifyServer.ready(onFastifyReady(fastifyServer))
  await fastifyServer.listen({ host, port })
  console.log(`Listening on ${host}:${port}`)
  if (config.devInitialData) {
    await insertAndWarnDevInitialData(fastifyServer)
  }
}

const stopServer = async (server: ServerT) => {
  const { fastifyServer } = server
  console.debug('Closing')
  await fastifyServer.prisma.$disconnect()
  await fastifyServer.redis.disconnect()
  await fastifyServer.close()
}

export { buildServer, startServer, stopServer, onRedisError, onFastifyReady }
