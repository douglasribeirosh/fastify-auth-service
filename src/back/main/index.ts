import { Server } from './server'
import { ServerT } from './types/server'

const bootstrap = async () => {
  try {
    const server: ServerT = new Server()
    await server.start()
  } catch (err) {
    console.error((err as Error).message)
    setTimeout(() => {
      // process.exit(1)
    }, 3000)
  }
}

void bootstrap()

export { bootstrap }
