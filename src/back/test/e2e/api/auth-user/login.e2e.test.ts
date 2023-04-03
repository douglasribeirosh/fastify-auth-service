import { e2e } from 'pactum'
import { string } from 'pactum-matchers'
import {
  getCurrentTestName,
  insertClient,
  insertDev,
  insertDomain,
  insertUser,
  loginClient,
  registerHooks,
} from '../../utils/test-case'

describe('backend tests', () => {
  describe('backend server /api/auth-user e2e tests', () => {
    describe('/api/auth-user/login', () => {
      registerHooks()
      test('should respond token for POST /api/auth-user/login and be able to POST /api/auth-user/logout with token', async () => {
        //Given
        const dev = await insertDev(true)
        const domain = await insertDomain(dev.id)
        const { id: domainId } = domain
        const client = await insertClient(domainId)
        await insertUser(domainId, true)
        const testCase = e2e(getCurrentTestName())
        await loginClient(testCase, { domainId, id: client.id, secret: client.secret })
        await testCase
          .step('POST /api/auth-user/login')
          .spec()
          // When
          .post('/api/auth-user/login')
          .withHeaders('AuthorizationClient', `Bearer $S{ClientToken}`)
          .withJson({ email: 'name@less.com', password: 'Us3rP@ssw0rd' })
          // Then
          .expectStatus(200)
          .expectJsonMatch({
            token: string(),
          })
          .stores('Token', 'token')
          .toss()
        await testCase
          .step('POST /api/auth-user/logout')
          .spec()
          // When
          .post('/api/auth-user/logout')
          .withHeaders('AuthorizationClient', `Bearer $S{ClientToken}`)
          .withHeaders('Authorization', `Bearer $S{Token}`)
          .withJson({ domainId })
          // Then
          .expectStatus(400)
          .toss()
        await testCase
          .step('POST /api/auth-user/logout')
          .spec()
          // When
          .post('/api/auth-user/logout')
          .withHeaders('AuthorizationClient', `Bearer $S{ClientToken}`)
          .withHeaders('Authorization', `Bearer $S{Token}`)
          // Then
          .expectStatus(204)
          .expectBody('')
          .toss()
        await testCase
          .step('GET /api/auth-user/whoami')
          .spec()
          // When
          .get('/api/auth-user/whoami')
          .withHeaders('AuthorizationClient', `Bearer $S{ClientToken}`)
          .withHeaders('Authorization', `Bearer $S{Token}`)
          // Then
          .expectStatus(401)
          .expectBody({
            code: 401,
            error: 'Unauthorized',
          })
          .toss()
        testCase.cleanup()
      })
      test('should respond 401 for POST /api/auth-user/login with unauthorized data', async () => {
        //Given
        const dev = await insertDev(true)
        const domain = await insertDomain(dev.id)
        const { id: domainId } = domain
        const client = await insertClient(domainId)
        const testCase = e2e(getCurrentTestName())
        await loginClient(testCase, { domainId, id: client.id, secret: client.secret })
        await testCase
          .step('POST /api/auth-user/login with invalid data')
          .spec()
          // When
          .post('/api/auth-user/login')
          .withHeaders('AuthorizationClient', `Bearer $S{ClientToken}`)
          .withJson({ domainId, email: 'name@less.com', password: 'P@ssw0rd' })
          // Then
          .expectStatus(401)
          .expectJson({
            code: 401,
            error: 'Unauthorized',
          })
          .toss()
        testCase.cleanup()
      })
      test('should respond 400 for POST /api/auth-user/login with invalid data', async () => {
        //Given
        const dev = await insertDev(true)
        const domain = await insertDomain(dev.id)
        const { id: domainId } = domain
        const client = await insertClient(domainId)
        const testCase = e2e(getCurrentTestName())
        await loginClient(testCase, { domainId, id: client.id, secret: client.secret })
        await testCase
          .step('POST /api/auth-user/login with invalid data')
          .spec()
          // When
          .post('/api/auth-user/login')
          .withHeaders('AuthorizationClient', `Bearer $S{ClientToken}`)
          .withJson({ domainId, email: 'name@less.com' })
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
