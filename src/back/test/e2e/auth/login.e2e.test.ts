import { e2e } from 'pactum'
import { string } from 'pactum-matchers'
import { getCurrentTestName, insertDev, registerHooks } from '../utils/test-case'

describe('backend tests', () => {
  describe('backend server /auth e2e tests', () => {
    describe('/auth/login', () => {
      registerHooks()
      test('should respond token for POST /auth/login and be able to POST /auth/logout with token', async () => {
        //Given
        await insertDev(true)
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /auth/login')
          .spec()
          // When
          .post('/auth/login')
          .withJson({ username: 'login', password: 'P@ssw0rd' })
          // Then
          .expectStatus(200)
          .expectJsonMatch({
            token: string(),
          })
          .stores('Token', 'token')
          .toss()
        await testCase
          .step('POST /auth/logout')
          .spec()
          // When
          .post('/auth/logout')
          .withHeaders('Authorization', `Bearer $S{Token}`)
          .withJson({})
          // Then
          .expectStatus(400)
          .toss()
        await testCase
          .step('POST /auth/logout')
          .spec()
          // When
          .post('/auth/logout')
          .withHeaders('Authorization', `Bearer $S{Token}`)
          // Then
          .expectStatus(204)
          .expectBody('')
          .toss()
        testCase.cleanup()
      })
      test('should respond 400 for POST /auth/login with invalid data', async () => {
        //Given
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /auth/login with invalid data')
          .spec()
          // When
          .post('/auth/login')
          .withJson({ username: 'login' })
          // Then
          .expectStatus(400)
          .expectJson({
            code: 400,
            error: {
              issues: [
                {
                  code: 'invalid_type',
                  expected: 'string',
                  message: 'Required',
                  path: ['password'],
                  received: 'undefined',
                },
              ],
              name: 'ZodError',
            },
          })
          .toss()
        testCase.cleanup()
      })
      test('should respond 401 for POST /auth/login with unauthorized data', async () => {
        //Given
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /auth/login with invalid data')
          .spec()
          // When
          .post('/auth/login')
          .withJson({ username: 'login', password: 'P@ssw0rd' })
          // Then
          .expectStatus(401)
          .expectJson({
            code: 401,
            error: 'Unauthorized',
          })
          .toss()
        testCase.cleanup()
      })
      test('should respond 400 for POST /auth/login with invalid data', async () => {
        //Given
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /auth/login with invalid data')
          .spec()
          // When
          .post('/auth/login')
          .withJson({ username: 'login' })
          // Then
          .expectStatus(400)
          .expectJson({
            code: 400,
            error: {
              issues: [
                {
                  code: 'invalid_type',
                  expected: 'string',
                  message: 'Required',
                  path: ['password'],
                  received: 'undefined',
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
