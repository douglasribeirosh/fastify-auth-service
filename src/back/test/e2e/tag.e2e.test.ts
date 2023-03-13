import { Server } from "../../main/server"
import { e2e, request } from 'pactum'

describe('backend tests', () => {
  describe('backend server tag e2e tests', () => {
    describe('GET /tag', () => {
      let server: Server | null
      beforeAll(async () => {
        let serverBaseUrl = "http://localhost:33666"
        server = new Server()
        console.debug("Server starting....")
        await server.start()
        request.setBaseUrl(serverBaseUrl)
      })
      beforeEach(() => {

      })
      afterEach(async () => {

      })
      afterAll(async () => {
        if (!server) {
          return
        }
        await server.stop()
      })
      test('should respond latest', async () => {
        //Given
        const { currentTestName } = expect.getState()
        if (!currentTestName) {
          throw new Error('Impossible to get the current test name in expect state')
        }
        const testCase = e2e(currentTestName)
        // await delay(3000000, true)
        await testCase
          .step('Get tagcheck')
          .spec()
          // When
          .get('/tag')
          // Then
          .expectStatus(200)
          .expectBody('latest').toss()
        testCase.cleanup()
      })
    })
  })
})
