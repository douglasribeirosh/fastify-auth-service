import { e2e } from 'pactum'
import { insertDomain, insertUser, insertUserWithData } from '../../utils/test-case'
import { getCurrentTestName, insertDev, registerHooks } from '../../utils/test-case'

describe('backend tests', () => {
  describe('backend server /api/domain-auth e2e tests', () => {
    describe('/api/domain-auth/reset-pass', () => {
      registerHooks()
      test('should respond 204 for POST /api/domain-auth/reset-pass with data', async () => {
        //Given
        const dev = await insertDev()
        const domain = await insertDomain(dev.id)
        const { id: domainId } = domain
        await insertUser(domainId)
        await insertUserWithData({ domainId, email: 'name1@less.com' })
        await insertUserWithData({ domainId, email: 'name2@less.com', name: 'name2' })
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /api/domain-auth/reset-pass')
          .spec()
          // When
          .post('/api/domain-auth/reset-pass')
          .withJson({ domainId, email: 'name@less.com' })
          // Then
          .expectStatus(204)
          .expectBody('')
          .toss()
        await testCase
          .step('POST /api/domain-auth/reset-pass')
          .spec()
          // When
          .post('/api/domain-auth/reset-pass')
          .withJson({ domainId, email: 'name1@less.com' })
          // Then
          .expectStatus(204)
          .expectBody('')
          .toss()
        await testCase
          .step('POST /api/domain-auth/reset-pass')
          .spec()
          // When
          .post('/api/domain-auth/reset-pass')
          .withJson({ domainId, email: 'name2@less.com' })
          // Then
          .expectStatus(204)
          .expectBody('')
          .toss()
        testCase.cleanup()
      })
      test('should respond 400 for POST /api/domain-auth/reset-pass with invalid email', async () => {
        //Given
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /api/domain-auth/reset-pass')
          .spec()
          // When
          .post('/api/domain-auth/reset-pass')
          .withJson({ email: 'name' })
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
                  path: ['domainId'],
                  received: 'undefined',
                },
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
      test('should respond 404 for POST /api/domain-auth/reset-pass with not existing email', async () => {
        //Given
        const dev = await insertDev()
        const domain = await insertDomain(dev.id)
        const { id: domainId } = domain
        await insertUser(domainId)
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /api/domain-auth/reset-pass')
          .spec()
          // When
          .post('/api/domain-auth/reset-pass')
          .withJson({ domainId, email: 'anothername@less.com' })
          // Then
          .expectStatus(404)
          .expectJson({
            code: 404,
            error: 'User not found',
          })
          .toss()
        testCase.cleanup()
      })
    })
  })
})
