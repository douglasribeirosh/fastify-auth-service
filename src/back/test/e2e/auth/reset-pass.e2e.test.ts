import { e2e } from 'pactum'
import { getCurrentTestName, insertDev, registerHooks } from '../utils/test-case'

describe('backend tests', () => {
  describe('backend server /auth e2e tests', () => {
    describe('/auth/reset-pass', () => {
      registerHooks()
      test('should respond 204 for POST /auth/reset-pass with data', async () => {
        //Given
        await insertDev()
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /auth/reset-pass')
          .spec()
          // When
          .post('/auth/reset-pass')
          .withJson({ email: 'name@less.com' })
          // Then
          .expectStatus(204)
          .expectBody('')
          .toss()
        testCase.cleanup()
      })
      test('should respond 400 for POST /auth/reset-pass with invalid email', async () => {
        //Given
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /auth/reset-pass')
          .spec()
          // When
          .post('/auth/reset-pass')
          .withJson({ email: 'name' })
          // Then
          .expectStatus(400)
          .expectJson({
            code: 400,
            error: {
              issues: [
                {
                  code: 'invalid_string',
                  message: 'Invalid email',
                  path: ['email'],
                  validation: 'email',
                },
              ],
              name: 'ZodError',
            },
          })
          .toss()
        testCase.cleanup()
      })
      test('should respond 404 for POST /auth/reset-pass with not existing email', async () => {
        //Given
        await insertDev()
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /auth/reset-pass')
          .spec()
          // When
          .post('/auth/reset-pass')
          .withJson({ email: 'anothername@less.com' })
          // Then
          .expectStatus(404)
          .expectJson({
            code: 404,
            error: 'Dev not found',
          })
          .toss()
        testCase.cleanup()
      })
    })
  })
})
