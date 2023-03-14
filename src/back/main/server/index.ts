import fastify from 'fastify'
import { Config } from '../types/config'
import { ServerT } from '../types/server'

const buildServer = (config: Config) => {
  const fastifyServer = fastify({ logger: { level: config.logLevel } })
  fastifyServer.decorate('config', config)
  return { fastifyServer }
}

const startServer = async (server: ServerT) => {
  const { fastifyServer } = server
  const { config } = fastifyServer
  console.log({ config })
  fastifyServer.get('/health', async (/*request, reply*/) => {
    return { web: 'HEALTHY' }
  })
  fastifyServer.get('/tag', async (/*request, reply*/) => {
    return process.env[`IMAGE_VERSION`] ?? 'latest'
  })
  const { host, port } = config
  await fastifyServer.listen({ host, port: +port })
  console.log(`Listening on ${host}:${port}`)
}

const stopServer = async (server: ServerT) => {
  const { fastifyServer } = server
  console.debug('Closing')
  await fastifyServer.close()
}

export { buildServer, startServer, stopServer }
