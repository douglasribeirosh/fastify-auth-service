import { e2e } from 'pactum'
import { getCurrentTestName, registerHooks } from './utils/test-case'

describe('backend tests', () => {
  describe('backend server tag e2e tests', () => {
    describe('GET /tag', () => {
      registerHooks()
      test('should respond latest', async () => {
        //Given
        const testCase = e2e(getCurrentTestName())
        // await delay(3000000, true)
        await testCase
          .step('Get tagcheck')
          .spec()
          // When
          .get('/tag')
          // Then
          .expectStatus(200)
          .expectBody('latest')
          .toss()
        testCase.cleanup()
      })
    })
  })
})
