import { buildConfigFromEnv } from './config'
import { buildServer, startServer } from './server'

const bootstrap = async () => {
  try {
    const config = buildConfigFromEnv()
    const server = buildServer(config)
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
