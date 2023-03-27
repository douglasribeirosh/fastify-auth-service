import { hash } from 'bcryptjs'
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

const insertUser = async (withPassword = false) => {
  const { prisma } = getCurrentServer()?.fastifyServer
  const passwordHash = withPassword ? await hash('P@ssw0rd', 10) : undefined
  return await prisma.user.create({
    data: {
      name: 'name',
      email: 'name@less.com',
      username: 'login',
      passwordHash,
    },
  })
}

export { getCurrentServer, getCurrentTestName, registerHooks, insertUser }
