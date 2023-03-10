import fastify, { FastifyBaseLogger, FastifyInstance, FastifyTypeProviderDefault } from 'fastify'
import { Server as FastifyServer, IncomingMessage, ServerResponse } from 'http'
import { ServerT } from '../types/server'

class Server implements ServerT {

  fastifyServer?: FastifyInstance<FastifyServer, IncomingMessage, ServerResponse, FastifyBaseLogger, FastifyTypeProviderDefault> & PromiseLike<FastifyInstance<FastifyServer, IncomingMessage, ServerResponse, FastifyBaseLogger, FastifyTypeProviderDefault>>

  async start() {
    this.fastifyServer = fastify()

    this.fastifyServer.get('/health', async (/*request, reply*/) => {
      return { web: "HEALTHY" }
    })

    this.fastifyServer.get('/tag', async (/*request, reply*/) => {
      return process.env[`IMAGE_VERSION`] ?? 'latest'
    })

    const host = '0.0.0.0'
    const port = process.env[`PORT`] ? +process.env[`PORT`] : 33666
    await this.fastifyServer.listen(
      { host, port }
    )
    console.log(`Listening on ${host}:${port}`)
  }
  async stop() {
    if (this.fastifyServer) {
      console.debug("Closing")
      await this.fastifyServer.close()
    }
  }
}

export { Server }
