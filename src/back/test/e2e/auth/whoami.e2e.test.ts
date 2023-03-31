import { e2e } from 'pactum'
import { int, string, uuid } from 'pactum-matchers'
import { getCurrentTestName, insertDev, registerHooks } from '../utils/test-case'

describe('backend tests', () => {
  describe('backend server /auth e2e tests', () => {
    describe('/auth', () => {
      registerHooks()
      test('should respond unauthorized for GET /auth/whoami', async () => {
        //Given
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('GET /auth/whoami')
          .spec()
          // When
          .get('/auth/whoami')
          // Then
          .expectStatus(401)
          .expectJson({
            code: 'FST_JWT_NO_AUTHORIZATION_IN_HEADER',
            error: 'Unauthorized',
            message: 'No Authorization was found in request.headers',
            statusCode: 401,
          })
          .toss()
        testCase.cleanup()
      })
      test('should respond dev for GET /auth/whoami with Authorization and Unauthorized after POST /auth/logout', async () => {
        //Given
        await insertDev(true)
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /auth/login')
          .spec()
          .post('/auth/login')
          .withJson({ username: 'login', password: 'P@ssw0rd' })
          .expectStatus(200)
          .expectJsonMatch({
            token: string(),
          })
          .stores('Token', 'token')
          .toss()
        await testCase
          .step('GET /auth/whoami')
          .spec()
          // When
          .withHeaders('Authorization', `Bearer $S{Token}`)
          .get('/auth/whoami')
          // Then
          .expectStatus(200)
          .expectJsonMatch({
            iat: int(),
            id: uuid(),
            username: 'login',
          })
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
        await testCase
          .step('GET /auth/whoami')
          .spec()
          // When
          .get('/auth/whoami')
          .withHeaders('Authorization', `Bearer $S{Token}`)
          // Then
          .expectStatus(401)
          .expectJson({
            code: 401,
            error: 'Unauthorized',
          })
          .toss()
        testCase.cleanup()
      })
    })
  })
})
