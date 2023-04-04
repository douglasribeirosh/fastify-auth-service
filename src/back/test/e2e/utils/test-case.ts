import { hash } from 'bcryptjs'
import { request } from 'pactum'
import E2E from 'pactum/src/models/E2E'
import { defaultTestConfig } from '../../../main/config'
import { buildServer, startServer, stopServer } from '../../../main/server'
import { ServerT } from '../../../main/types/server'

let server: ServerT | null

const registerHooks = (devInitialData = false) => {
  beforeAll(async () => {
    const config = defaultTestConfig
    if (devInitialData) {
      config.devInitialData = true
    }
    let serverBaseUrl = 'http://localhost:33667'
    server = await buildServer(config)
    console.debug('Server starting....')
    await startServer(server)
    request.setBaseUrl(serverBaseUrl)
  })
  beforeEach(async () => {
    await server?.fastifyServer.prisma.user.deleteMany()
    await server?.fastifyServer.prisma.client.deleteMany()
    await server?.fastifyServer.prisma.domain.deleteMany()
    await server?.fastifyServer.prisma.dev.deleteMany()
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

const insertDev = async (withPassword = false) => {
  const { prisma } = getCurrentServer()?.fastifyServer
  const passwordHash = withPassword ? await hash('P@ssw0rd', 10) : undefined
  return await prisma.dev.create({
    data: {
      name: 'name',
      email: 'name@less.com',
      username: 'login',
      passwordHash,
    },
  })
}

const insertDomain = async (devId: string) => {
  const { prisma } = getCurrentServer()?.fastifyServer
  return await prisma.domain.create({
    data: {
      name: 'test.domain',
      ownerId: devId,
    },
  })
}

const insertClient = async (domainId: string) => {
  const { prisma } = getCurrentServer()?.fastifyServer
  return await prisma.client.create({
    data: {
      domainId: domainId,
      name: 'Client',
    },
  })
}

const insertUser = async (domainId: string, withPassword = false) => {
  return await insertUserWithData(
    {
      domainId,
      name: 'name',
      email: 'name@less.com',
      nickname: 'nick',
      namePrefix: 'Me.',
    },
    withPassword,
  )
}

const insertUserWithData = async (
  data: { domainId: string; name?: string; email: string; nickname?: string; namePrefix?: string },
  withPassword = false,
) => {
  const { prisma } = getCurrentServer()?.fastifyServer
  const passwordHash = withPassword ? await hash('Us3rP@ssw0rd', 10) : undefined
  return await prisma.user.create({
    data: { ...data, passwordHash },
  })
}

const login = async (testCase: E2E) => {
  await testCase
    .step('POST /auth/login')
    .spec()
    .post('/auth/login')
    .withJson({ username: 'login', password: 'P@ssw0rd' })
    .expectStatus(200)
    .stores('Token', 'token')
    .toss()
}

const loginClient = async (
  testCase: E2E,
  data: { domainId: string; id: string; secret: string },
) => {
  await testCase
    .step('POST /api/auth-client/login')
    .spec()
    .post('/api/auth-client/login')
    .withJson(data)
    // Then
    .expectStatus(200)
    .stores('ClientToken', 'token')
    .toss()
}

const loginUser = async (testCase: E2E) => {
  await testCase
    .step('POST /api/auth-user/login')
    .spec()
    .post('/api/auth-user/login')
    .withHeaders('AuthorizationClient', `Bearer $S{ClientToken}`)
    .withJson({ email: 'name@less.com', password: 'Us3rP@ssw0rd' })
    // Then
    .expectStatus(200)
    .stores('UserToken', 'token')
    .toss()
}

export {
  getCurrentServer,
  getCurrentTestName,
  registerHooks,
  insertDev,
  login,
  loginClient,
  loginUser,
  insertDomain,
  insertClient,
  insertUser,
  insertUserWithData,
}
