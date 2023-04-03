import { e2e } from 'pactum'
import { int } from 'pactum-matchers'
import {
  getCurrentTestName,
  insertClient,
  insertDev,
  insertDomain,
  login,
  loginClient,
  registerHooks,
} from '../../utils/test-case'

describe('backend tests', () => {
  describe('backend server /api/auth-client e2e tests', () => {
    describe('/api/auth-client/whoami', () => {
      registerHooks()
      test('logged in client should be logged out after DELETE /api/domains/:domainId/clients/:id', async () => {
        //Given
        const dev = await insertDev(true)
        const domain = await insertDomain(dev.id)
        const { id: domainId } = domain
        const client = await insertClient(domainId)
        const testCase = e2e(getCurrentTestName())
        await login(testCase)
        await loginClient(testCase, { domainId, id: client.id, secret: client.secret })
        await testCase
          .step('GET /api/auth-client/whoami')
          .spec()
          // When
          .get('/api/auth-client/whoami')
          .withHeaders('AuthorizationClient', `Bearer $S{ClientToken}`)
          // Then
          .expectStatus(200)
          .expectJsonMatchStrict({
            id: client.id,
            domainId: domainId,
            iat: int(),
          })
          .toss()
        await testCase
          .step('DELETE /api/domains/:domainId/clients/:id')
          .spec()
          // When
          .withHeaders('Authorization', `Bearer $S{Token}`)
          .delete('/api/domains/{domainId}/clients/{id}')
          .withPathParams('domainId', domainId)
          .withPathParams('id', client.id)
          // Then
          .expectStatus(204)
          .expectBody('')
          .toss()
        await testCase
          .step('GET /api/auth-client/whoami/')
          .spec()
          // When
          .get('/api/auth-client/whoami/')
          .withHeaders('AuthorizationClient', `Bearer $S{ClientToken}`)
          // Then
          .expectStatus(401)
          .expectJsonMatchStrict({
            code: 401,
            error: 'Unauthorized',
          })
          .toss()
        testCase.cleanup()
      })
    })
  })
})
