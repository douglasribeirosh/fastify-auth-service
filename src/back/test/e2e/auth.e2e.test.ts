import { e2e } from 'pactum'
import { string } from 'pactum-matchers'
import { getCurrentTestName, registerHooks } from './utils/test-case'

describe('backend tests', () => {
  describe('backend server /auth e2e tests', () => {
    describe('/auth', () => {
      registerHooks()
      test('should respond token for POST /auth/token', async () => {
        //Given
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /auth/token')
          .spec()
          // When
          .post('/auth/token')
          .withJson({ login: 'login', password: 'P@ssw0rd' })
          // Then
          .expectStatus(200)
          .expectJsonMatch({
            token: string(),
          })
          .toss()
        testCase.cleanup()
      })
      test('should respond 200 for POST /auth/signup with data', async () => {
        //Given
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /auth/signup')
          .spec()
          // When
          .post('/auth/signup')
          .withJson({ name: 'Name Less', email: 'name@less.com', username: 'usernameless' })
          // Then
          .expectStatus(204)
          .expectBody('')
          .toss()
        testCase.cleanup()
      })
      test('should respond 400 for POST /auth/signup with invalid email', async () => {
        //Given
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /auth/signup')
          .spec()
          // When
          .post('/auth/signup')
          .withJson({ name: 'Name Less', email: 'name', username: 'usernameless' })
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
    })
  })
})
