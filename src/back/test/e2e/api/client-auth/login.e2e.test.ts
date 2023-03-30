import { randomUUID } from 'crypto'
import { e2e } from 'pactum'
import { string } from 'pactum-matchers'
import {
  getCurrentTestName,
  insertDev,
  insertDomain,
  insertClient,
  registerHooks,
} from '../../utils/test-case'

describe('backend tests', () => {
  describe('backend server /api/client-auth e2e tests', () => {
    describe('/api/client-auth/login', () => {
      registerHooks()
      test('should respond token for POST /api/client-auth/login', async () => {
        //Given
        const dev = await insertDev(true)
        const domain = await insertDomain(dev.id)
        const { id: domainId } = domain
        const client = await insertClient(domainId)
        const { id, secret } = client
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /api/client-auth/login')
          .spec()
          // When
          .post('/api/client-auth/login')
          .withJson({ domainId, id, secret })
          // Then
          .expectStatus(200)
          .expectJsonMatch({
            token: string(),
          })
          .toss()
        testCase.cleanup()
      })
      test('should respond 401 for POST /api/client-auth/login with unauthorized data', async () => {
        //Given
        const dev = await insertDev(true)
        const domain = await insertDomain(dev.id)
        const { id: domainId } = domain
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /api/client-auth/login with invalid data')
          .spec()
          // When
          .post('/api/client-auth/login')
          .withJson({ domainId, id: randomUUID(), secret: randomUUID() })
          // Then
          .expectStatus(401)
          .expectJson({
            code: 401,
            error: 'Unauthorized',
          })
          .toss()
        testCase.cleanup()
      })
      test('should respond 400 for POST /api/client-auth/login with invalid data', async () => {
        //Given
        const dev = await insertDev(true)
        const domain = await insertDomain(dev.id)
        const { id: domainId } = domain
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /api/client-auth/login with invalid data')
          .spec()
          // When
          .post('/api/client-auth/login')
          .withJson({ domainId, id: randomUUID() })
          // Then
          .expectJson({
            code: 400,
            error: {
              issues: [
                {
                  code: 'invalid_type',
                  expected: 'string',
                  message: 'Required',
                  path: ['secret'],
                  received: 'undefined',
                },
              ],
              name: 'ZodError',
            },
          })
          .expectStatus(400)
          .toss()
        testCase.cleanup()
      })
    })
  })
})
