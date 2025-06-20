import { e2e } from 'pactum'
import {
  getCurrentTestName,
  insertClient,
  insertDev,
  insertDomain,
  loginClient,
  registerHooks,
} from '../../utils/test-case'

describe('backend tests', () => {
  describe('backend server /api/auth-user e2e tests', () => {
    describe('/api/auth-user/register', () => {
      registerHooks()
      test('should respond 204 for POST /api/auth-user/register with data but Error second time', async () => {
        //Given
        const dev = await insertDev()
        const domain = await insertDomain(dev.id)
        const { id: domainId } = domain
        const client = await insertClient(domainId)
        const testCase = e2e(getCurrentTestName())
        await loginClient(testCase, { domainId, id: client.id, secret: client.secret })
        await testCase
          .step('POST /api/auth-user/register')
          .spec()
          // When
          .post('/api/auth-user/register')
          .withHeaders('AuthorizationClient', `Bearer $S{ClientToken}`)
          .withJson({ email: 'name@less.com' })
          // Then
          .expectBody('')
          .expectStatus(204)
          .toss()
        await testCase
          .step('POST /api/auth-user/register second time')
          .spec()
          // When
          .post('/api/auth-user/register')
          .withHeaders('AuthorizationClient', `Bearer $S{ClientToken}`)
          .withJson({ email: 'name@less.com' })
          // Then
          .expectStatus(400)
          .expectJson({
            code: 400,
            error: 'Email or username already signed up',
          })
          .toss()
        testCase.cleanup()
      })
      test('should respond 204 for POST /api/auth-user/register with optionals name and namePrefix for user', async () => {
        //Given
        const dev = await insertDev()
        const domain = await insertDomain(dev.id)
        const { id: domainId } = domain
        const client = await insertClient(domainId)
        const testCase = e2e(getCurrentTestName())
        await loginClient(testCase, { domainId, id: client.id, secret: client.secret })
        await testCase
          .step('POST /api/auth-user/register')
          .spec()
          // When
          .post('/api/auth-user/register')
          .withHeaders('AuthorizationClient', `Bearer $S{ClientToken}`)
          .withJson({ namePrefix: 'Me.', name: 'Name Less', email: 'name@less.com' })
          // Then
          .expectBody('')
          .expectStatus(204)
          .toss()
        testCase.cleanup()
      })
      test('should respond 204 for POST /api/auth-user/register with optional name for user', async () => {
        //Given
        const dev = await insertDev()
        const domain = await insertDomain(dev.id)
        const { id: domainId } = domain
        const client = await insertClient(domainId)
        const testCase = e2e(getCurrentTestName())
        await loginClient(testCase, { domainId, id: client.id, secret: client.secret })
        await testCase
          .step('POST /api/auth-user/register')
          .spec()
          // When
          .post('/api/auth-user/register')
          .withHeaders('AuthorizationClient', `Bearer $S{ClientToken}`)
          .withJson({ name: 'Name Less', email: 'name@less.com', domainId })
          // Then
          .expectBody('')
          .expectStatus(204)
          .toss()
        testCase.cleanup()
      })
      test('should respond 400 for POST /api/auth-user/register with invalid email', async () => {
        //Given
        const dev = await insertDev()
        const domain = await insertDomain(dev.id)
        const { id: domainId } = domain
        const client = await insertClient(domainId)
        const testCase = e2e(getCurrentTestName())
        await loginClient(testCase, { domainId, id: client.id, secret: client.secret })
        await testCase
          .step('POST /api/auth-user/register')
          .spec()
          // When
          .post('/api/auth-user/register')
          .withHeaders('AuthorizationClient', `Bearer $S{ClientToken}`)
          .withJson({ email: 'name', domainId })
          // Then
          .expectStatus(400)
          .expectJson({
            code: 400,
            error: {
              issues: [
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
    })
  })
})
