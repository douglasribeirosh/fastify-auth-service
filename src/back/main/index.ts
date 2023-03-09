import config from './config'
import { Server } from './server'
//import { createLogger } from './utils/logger'

// const server = fastify()
//
// server.get('/ping', async (/*request, reply*/) => {
//   return 'pong\n'
// })
//
// server.get('/tag', async (/*request, reply*/) => {
//   return process.env[`IMAGE_VERSION`] ?? 'latest'
// })
//
// server.listen(
//   { host: '0.0.0.0', port: process.env[`PORT`] ? +process.env[`PORT`] : 33666 },
//   (err, address) => {
//     if (err) {
//       process.exit(1)
//     }
//   },
// )

const bootstrap = async () => {
  //const log = createLogger({ level: config.logLevel })
  try {
    const server = new Server(config, log)
    await server.start()
  } catch (err) {
    log.error((err as Error).message)
    setTimeout(() => {
      process.exit(1)
    }, 3000)
  }
}

void bootstrap()

export { bootstrap }
