import { buildServer, startServer } from './server'

const bootstrap = async () => {
  try {
    const server = buildServer()
    await startServer(server)
  } catch (err) {
    console.error((err as Error).message)
    setTimeout(() => {
      process.exit(1)
    }, 3000)
  }
}

void bootstrap()

export { bootstrap }
