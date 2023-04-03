import { randomUUID } from 'crypto'
import { e2e } from 'pactum'
import { string } from 'pactum-matchers'
import { insertDomain } from '../../utils/test-case'
import { getCurrentTestName, insertDev, login, registerHooks } from '../../utils/test-case'

describe('backend tests', () => {
  describe('backend server /api/domains e2e tests', () => {
    describe('/api/domains', () => {
      registerHooks()
      test('should respond 400 for CRUD /api/domains when sending invalid data', async () => {
        //Given
        const dev = await insertDev(true)
        const domain = await insertDomain(dev.id)
        const { id: domainId } = domain
        const testCase = e2e(getCurrentTestName())
        await login(testCase)
        const expectedErrorForPost = {
          issues: [
            {
              code: 'unrecognized_keys',
              keys: ['key'],
              message: "Unrecognized key(s) in object: 'key'",
              path: [],
            },
          ],
          name: 'ZodError',
        }
        await testCase
          .step('POST /api/domains/:domainId/clients')
          .spec()
          // When
          .withHeaders('Authorization', `Bearer $S{Token}`)
          .post('/api/domains/{domainId}/clients')
          .withPathParams('domainId', domainId)
          .withJson({ key: 'value', name: 'Client' })
          // Then
          .expectJson({ code: 400, error: expectedErrorForPost })
          .expectStatus(400)
          .toss()
        testCase.cleanup()
      })
      test('should respond 401 for CRD /api/domains/:domainId/clients when domain does not exist', async () => {
        //Given
        await insertDev(true)
        const testCase = e2e(getCurrentTestName())
        await login(testCase)
        const domainId = randomUUID()
        const clientId = randomUUID()
        await testCase
          .step('POST /api/domains/:domainId/clients')
          .spec()
          // When
          .withHeaders('Authorization', `Bearer $S{Token}`)
          .post('/api/domains/{domainId}/clients')
          .withJson({ name: 'Client' })
          .withPathParams('domainId', domainId)
          // Then
          .expectJson({ code: 401, error: 'Unauthorized' })
          .expectStatus(401)
          .toss()
        await testCase
          .step('GET /api/domains/:domainId/clients')
          .spec()
          // When
          .withHeaders('Authorization', `Bearer $S{Token}`)
          .get('/api/domains/{domainId}/clients')
          .withPathParams('domainId', domainId)
          // Then
          .expectJson({ code: 401, error: 'Unauthorized' })
          .expectStatus(401)
          .toss()
        await testCase
          .step('GET /api/domains/:domainId/clients/:id')
          .spec()
          // When
          .withHeaders('Authorization', `Bearer $S{Token}`)
          .get('/api/domains/{domainId}/clients/{id}')
          .withPathParams('domainId', domainId)
          .withPathParams('id', clientId)
          // Then
          .expectStatus(401)
          .expectJson({ code: 401, error: 'Unauthorized' })
          .toss()
        await testCase
          .step('DELETE /api/domains/:domainId/clients/:id')
          .spec()
          // When
          .withHeaders('Authorization', `Bearer $S{Token}`)
          .delete('/api/domains/{domainId}/clients/{id}')
          .withPathParams('domainId', domainId)
          .withPathParams('id', clientId)
          // Then
          .expectStatus(401)
          .expectJson({ code: 401, error: 'Unauthorized' })
          .toss()
        testCase.cleanup()
      })
      test('should respond 404 for RD /api/domains/:domainId/clients when client does not exist', async () => {
        //Given
        const dev = await insertDev(true)
        const domain = await insertDomain(dev.id)
        const { id: domainId } = domain
        const testCase = e2e(getCurrentTestName())
        await login(testCase)
        const clientId = randomUUID()
        await testCase
          .step('GET /api/domains/:domainId/clients/:id')
          .spec()
          // When
          .withHeaders('Authorization', `Bearer $S{Token}`)
          .get('/api/domains/{domainId}/clients/{id}')
          .withPathParams('domainId', domainId)
          .withPathParams('id', clientId)
          // Then
          .expectStatus(404)
          .expectJson({ code: 404, error: 'Client not found' })
          .toss()
        await testCase
          .step('DELETE /api/domains/:domainId/clients/:id')
          .spec()
          // When
          .withHeaders('Authorization', `Bearer $S{Token}`)
          .delete('/api/domains/{domainId}/clients/{id}')
          .withPathParams('domainId', domainId)
          .withPathParams('id', clientId)
          // Then
          .expectStatus(404)
          .expectJson({ code: 404, error: 'Client not found' })
          .toss()
        testCase.cleanup()
      })
      test('should pass tests for CRD /api/domains/:domainId/clients', async () => {
        //Given
        const dev = await insertDev(true)
        const domain = await insertDomain(dev.id)
        const { id: domainId } = domain
        const testCase = e2e(getCurrentTestName())
        await login(testCase)
        await testCase
          .step('POST /api/domains/:domainId/clients')
          .spec()
          // When
          .withHeaders('Authorization', `Bearer $S{Token}`)
          .post('/api/domains/{domainId}/clients')
          .withPathParams('domainId', domainId)
          .withJson({ name: 'Client' })
          // Then
          .expectStatus(200)
          .expectJsonMatchStrict({
            id: string(),
            name: 'Client',
            secret: string(),
            domainId: domain.id,
            createdAt: string(),
            updatedAt: string(),
          })
          .stores('ClientId', 'id')
          .stores('ClientSecret', 'secret')
          .stores('ClientCreatedAt', 'createdAt')
          .stores('ClientUpdatedAt', 'updatedAt')
          .toss()
        const expectedClient = {
          id: `$S{ClientId}`,
          name: 'Client',
          secret: `$S{ClientSecret}`,
          createdAt: `$S{ClientCreatedAt}`,
          domainId: domainId,
          updatedAt: `$S{ClientUpdatedAt}`,
        }
        await testCase
          .step('GET /api/domains/:domainId/clients')
          .spec()
          // When
          .withHeaders('Authorization', `Bearer $S{Token}`)
          .get('/api/domains/{domainId}/clients')
          .withPathParams('domainId', domainId)
          // Then
          .expectStatus(200)
          .expectJson([expectedClient])
          .toss()
        await testCase
          .step('GET /api/domains/:domainId/clients/:id')
          .spec()
          // When
          .withHeaders('Authorization', `Bearer $S{Token}`)
          .get('/api/domains/{domainId}/clients/{id}')
          .withPathParams('domainId', domainId)
          .withPathParams('id', `$S{ClientId}`)
          // Then
          .expectStatus(200)
          .expectJson(expectedClient)
          .toss()
        await testCase
          .step('DELETE /api/domains/:domainId/clients/:id')
          .spec()
          // When
          .withHeaders('Authorization', `Bearer $S{Token}`)
          .delete('/api/domains/{domainId}/clients/{id}')
          .withPathParams('domainId', domainId)
          .withPathParams('id', `$S{ClientId}`)
          // Then
          .expectStatus(204)
          .expectBody('')
          .toss()
        await testCase
          .step('GET /api/domains/:domainId/clients/:id')
          .spec()
          // When
          .withHeaders('Authorization', `Bearer $S{Token}`)
          .get('/api/domains/{domainId}/clients/{id}')
          .withPathParams('domainId', domainId)
          .withPathParams('id', `$S{ClientId}`)
          // Then
          .expectStatus(404)
          .expectJson({ code: 404, error: 'Client not found' })
          .toss()
        testCase.cleanup()
      })
    })
  })
})
