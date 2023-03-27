import { randomUUID } from 'crypto'
import { e2e } from 'pactum'
import { notEquals, string } from 'pactum-matchers'
import { getCurrentTestName, insertDev, login, registerHooks } from '../utils/test-case'

describe('backend tests', () => {
  describe('backend server /api/domains e2e tests', () => {
    describe('/api/domains', () => {
      registerHooks()
      test('should respond 400 for CRUD /api/domains when sending invalid data', async () => {
        //Given
        await insertDev(true)
        const testCase = e2e(getCurrentTestName())
        await login(testCase)
        const domainId = randomUUID()
        const expectedErrorForPost = {
          issues: [
            {
              code: 'invalid_type',
              expected: 'string',
              message: 'Required',
              path: ['name'],
              received: 'undefined',
            },
          ],
          name: 'ZodError',
        }
        await testCase
          .step('POST /api/domains')
          .spec()
          // When
          .withHeaders('Authorization', `Bearer $S{Token}`)
          .post('/api/domains')
          .withJson({})
          // Then
          .expectStatus(400)
          .expectJson({ code: 400, error: expectedErrorForPost })
          .toss()
        const expectedErrorForPatch = {
          issues: [
            {
              code: 'custom',
              message: 'One of the fields must be defined',
              path: [],
            },
          ],
          name: 'ZodError',
        }
        await testCase
          .step('PATCH /api/domains/:id')
          .spec()
          // When
          .withHeaders('Authorization', `Bearer $S{Token}`)
          .patch('/api/domains/{id}')
          .withPathParams('id', domainId)
          .withJson({})
          // Then
          .expectStatus(400)
          .expectJson({ code: 400, error: expectedErrorForPatch })
          .toss()
        testCase.cleanup()
      })
      test('should respond 404 for CRUD /api/domains when domain not found', async () => {
        //Given
        await insertDev(true)
        const testCase = e2e(getCurrentTestName())
        await login(testCase)
        const domainId = randomUUID()
        await testCase
          .step('GET /api/domains/:id')
          .spec()
          // When
          .withHeaders('Authorization', `Bearer $S{Token}`)
          .get('/api/domains/{id}')
          .withPathParams('id', domainId)
          // Then
          .expectStatus(404)
          .expectJson({ code: 404, error: 'Domain not found' })
          .toss()
        await testCase
          .step('PATCH /api/domains/:id')
          .spec()
          // When
          .withHeaders('Authorization', `Bearer $S{Token}`)
          .patch('/api/domains/{id}')
          .withPathParams('id', domainId)
          .withJson({ active: false })
          // Then
          .expectStatus(404)
          .expectJson({ code: 404, error: 'Domain not found' })
          .toss()
        await testCase
          .step('DELETE /api/domains/:id')
          .spec()
          // When
          .withHeaders('Authorization', `Bearer $S{Token}`)
          .delete('/api/domains/{id}')
          .withPathParams('id', domainId)
          // Then
          .expectStatus(404)
          .expectJson({ code: 404, error: 'Domain not found' })
          .toss()
        testCase.cleanup()
      })
      test('should pass tests for CRUD /api/domains', async () => {
        //Given
        const dev = await insertDev(true)
        const testCase = e2e(getCurrentTestName())
        await login(testCase)
        await testCase
          .step('POST /api/domains')
          .spec()
          // When
          .withHeaders('Authorization', `Bearer $S{Token}`)
          .post('/api/domains')
          .withBody({ name: 'domain-name' })
          // Then
          .expectStatus(200)
          .expectJsonMatchStrict({
            id: string(),
            name: 'domain-name',
            active: true,
            ownerId: dev.id,
            createdAt: string(),
            updatedAt: string(),
          })
          .stores('DomainId', 'id')
          .stores('DomainCreatedAt', 'createdAt')
          .stores('DomainUpdatedAt', 'updatedAt')
          .toss()
        const expectedDomain = {
          id: `$S{DomainId}`,
          name: 'domain-name',
          active: true,
          createdAt: `$S{DomainCreatedAt}`,
          ownerId: dev.id,
          updatedAt: `$S{DomainUpdatedAt}`,
        }
        await testCase
          .step('GET /api/domains')
          .spec()
          // When
          .withHeaders('Authorization', `Bearer $S{Token}`)
          .get('/api/domains')
          // Then
          .expectStatus(200)
          .expectJson([expectedDomain])
          .toss()
        await testCase
          .step('GET /api/domains/:id')
          .spec()
          // When
          .withHeaders('Authorization', `Bearer $S{Token}`)
          .get('/api/domains/{id}')
          .withPathParams('id', `$S{DomainId}`)
          // Then
          .expectStatus(200)
          .expectJson(expectedDomain)
          .toss()
        await testCase
          .step('PATCH /api/domains/:id')
          .spec()
          // When
          .withHeaders('Authorization', `Bearer $S{Token}`)
          .patch('/api/domains/{id}')
          .withPathParams('id', `$S{DomainId}`)
          .withJson({ active: false })
          // Then
          .expectStatus(200)
          .expectJsonMatchStrict({
            ...expectedDomain,
            active: false,
            updatedAt: notEquals(expectedDomain.updatedAt),
          })
          .toss()
        await testCase
          .step('DELETE /api/domains/:id')
          .spec()
          // When
          .withHeaders('Authorization', `Bearer $S{Token}`)
          .delete('/api/domains/{id}')
          .withPathParams('id', `$S{DomainId}`)
          // Then
          .expectStatus(204)
          .expectBody('')
          .toss()
        await testCase
          .step('GET /api/domains/:id')
          .spec()
          // When
          .withHeaders('Authorization', `Bearer $S{Token}`)
          .get('/api/domains/{id}')
          .withPathParams('id', `$S{DomainId}`)
          // Then
          .expectStatus(404)
          .expectJson({ code: 404, error: 'Domain not found' })
          .toss()
        testCase.cleanup()
      })
    })
  })
})
