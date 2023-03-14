import { e2e } from 'pactum'
import { getCurrentTestName, registerHooks } from './utils/test-case'

describe('backend tests', () => {
  describe('backend server health e2e tests', () => {
    describe('GET /health', () => {
      registerHooks()
      test('should respond a healthy json', async () => {
        //Given
        const testCase = e2e(getCurrentTestName())
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
