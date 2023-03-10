import { Server } from './server'

const bootstrap = async () => {
  try {
    const server = new Server()
    await server.start()
  } catch (err) {
    console.error(err)
    setTimeout(() => {
      process.exit(1)
    }, 3000)
  }
}

void bootstrap()

export { bootstrap }
