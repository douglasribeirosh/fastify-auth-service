import { request } from 'pactum'
import { defaultTestConfig } from '../../../main/config'
import { buildServer, startServer, stopServer } from '../../../main/server'
import { ServerT } from '../../../main/types/server'

let server: ServerT | null

const registerHooks = () => {
  beforeAll(async () => {
    let serverBaseUrl = 'http://localhost:33667'
    server = await buildServer(defaultTestConfig)
    console.debug('Server starting....')
    await startServer(server)
    request.setBaseUrl(serverBaseUrl)
  })
  beforeEach(async () => {
    await server?.fastifyServer.prisma.user.deleteMany()
  })
  afterEach(async () => {})
  afterAll(async () => {
    if (!server) {
      return
    }
    await stopServer(server)
  })
}

const getCurrentServer = () => server

const getCurrentTestName = () => {
  const { currentTestName } = expect.getState()
  if (!currentTestName) {
    throw new Error('Impossible to get the current test name in expect state')
  }
  return currentTestName
}

export { getCurrentServer, getCurrentTestName, registerHooks }
