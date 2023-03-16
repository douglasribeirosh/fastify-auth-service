import { e2e } from 'pactum'
import { int, string } from 'pactum-matchers'
import { getCurrentTestName, registerHooks } from '../utils/test-case'

describe('backend tests', () => {
  describe('backend server /api/users e2e tests', () => {
    describe('/api/users', () => {
      registerHooks()
      test('should respond unauthorized for GET /api/users/me', async () => {
        //Given
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('GET /api/users/me')
          .spec()
          // When
          .get('/api/users/me')
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
      test('should respond user for GET /api/users/me with Authorization', async () => {
        //Given
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /auth/token')
          .spec()
          .post('/auth/token')
          .expectStatus(200)
          .expectJsonMatch({
            token: string(),
          })
          .stores('Token', 'token')
          .toss()
        await testCase
          .step('GET /api/users/me')
          .spec()
          // When
          .withHeaders('Authorization', `Bearer $S{Token}`)
          .get('/api/users/me')
          // Then
          .expectStatus(200)
          .expectJsonMatch({
            iat: int(),
            login: 'login',
          })
          .toss()
        testCase.cleanup()
      })
    })
  })
})
