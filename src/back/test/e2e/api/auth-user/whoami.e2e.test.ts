import { e2e } from 'pactum'
import { int } from 'pactum-matchers'
import {
  getCurrentTestName,
  insertClient,
  insertDev,
  insertDomain,
  insertUser,
  login,
  loginClient,
  loginUser,
  registerHooks,
} from '../../utils/test-case'

describe('backend tests', () => {
  describe('backend server /api/auth-user e2e tests', () => {
    describe('GET /api/auth-user/whoami', () => {
      registerHooks()
      test('GET', async () => {
        //Given
        const dev = await insertDev(true)
        const domain = await insertDomain(dev.id)
        const { id: domainId } = domain
        const client = await insertClient(domainId)
        const user = await insertUser(domainId, true)
        const testCase = e2e(getCurrentTestName())
        await login(testCase)
        await loginClient(testCase, { domainId, id: client.id, secret: client.secret })
        await loginUser(testCase)
        await testCase
          .step('GET /api/auth-user/whoami')
          .spec()
          // When
          .get('/api/auth-user/whoami')
          .withHeaders('AuthorizationClient', `Bearer $S{ClientToken}`)
          .withHeaders('Authorization', `Bearer $S{UserToken}`)
          // Then
          .expectStatus(200)
          .expectJsonMatchStrict({
            id: user.id,
            nickname: 'nick',
            iat: int(),
          })
          .toss()
        await testCase
          .step('GET /api/auth-user/whoami')
          .spec()
          // When
          .get('/api/auth-user/whoami')
          .withHeaders('AuthorizationClient', `Bearer $S{ClientToken}`)
          .withHeaders('Authorization', `Bearer InvalidToken`)
          // Then
          .expectStatus(401)
          .expectJsonMatchStrict({
            code: 'FST_JWT_AUTHORIZATION_TOKEN_INVALID',
            error: 'Unauthorized',
            message: 'Authorization token is invalid: The token is malformed.',
            statusCode: 401,
          })
          .toss()
        testCase.cleanup()
      })
    })
  })
})
