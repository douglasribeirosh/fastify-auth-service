import fastify from 'fastify'
import { ServerT } from '../types/server'

const buildServer = () => {
  const fastifyServer = fastify()
  return { fastifyServer }
}

const startServer = async (server: ServerT) => {
  const { fastifyServer } = server
  fastifyServer.get('/health', async (/*request, reply*/) => {
    return { web: 'HEALTHY' }
  })
  fastifyServer.get('/tag', async (/*request, reply*/) => {
    return process.env[`IMAGE_VERSION`] ?? 'latest'
  })
  const host = '0.0.0.0'
  const port = process.env[`PORT`] ? +process.env[`PORT`] : 33666
  await fastifyServer.listen({ host, port })
  console.log(`Listening on ${host}:${port}`)
}

const stopServer = async (server: ServerT) => {
  const { fastifyServer } = server
  console.debug('Closing')
  await fastifyServer.close()
}

export { buildServer, startServer, stopServer }
