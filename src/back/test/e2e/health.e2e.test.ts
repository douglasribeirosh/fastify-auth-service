import { buildServer, Server, startServer, stopServer } from '../../main/server'
import { e2e, request } from 'pactum'

describe('backend tests', () => {
  describe('backend server health e2e tests', () => {
    describe('GET /health', () => {
      let server: Server | null
      beforeAll(async () => {
        let serverBaseUrl = 'http://localhost:33666'
        server = buildServer()
        console.debug('Server starting....')
        await startServer(server)
        request.setBaseUrl(serverBaseUrl)
      })
      beforeEach(() => {})
      afterEach(async () => {})
      afterAll(async () => {
        if (!server) {
          return
        }
        await stopServer(server)
      })
      test('should respond a healthy json', async () => {
        //Given
        const { currentTestName } = expect.getState()
        if (!currentTestName) {
          throw new Error('Impossible to get the current test name in expect state')
        }
        const testCase = e2e(currentTestName)
        // await delay(3000000, true)
        await testCase
          .step('Get healthcheck')
          .spec()
          // When
          .get('/health')
          // Then
          .expectStatus(200)
          .expectJson({
            web: 'HEALTHY',
          })
          .toss()
        testCase.cleanup()
      })
    })
  })
})
