import { e2e } from 'pactum'
import { getCurrentTestName, insertDev, insertDomain, registerHooks } from '../../utils/test-case'

describe('backend tests', () => {
  describe('backend server /api/domain-auth e2e tests', () => {
    describe('/api/domain-auth/register', () => {
      registerHooks()
      test('should respond 204 for POST /api/domain-auth/register with data but Error second time', async () => {
        //Given
        const dev = await insertDev()
        const domain = await insertDomain(dev.id)
        const { id: domainId } = domain
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /api/domain-auth/register')
          .spec()
          // When
          .post('/api/domain-auth/register')
          .withJson({ email: 'name@less.com', domainId })
          // Then
          .expectBody('')
          .expectStatus(204)
          .toss()
        await testCase
          .step('POST /api/domain-auth/register second time')
          .spec()
          // When
          .post('/api/domain-auth/register')
          .withJson({ email: 'name@less.com', domainId })
          // Then
          .expectStatus(400)
          .expectJson({
            code: 400,
            error: 'Email or username already signed up',
          })
          .toss()
        testCase.cleanup()
      })
      test('should respond 204 for POST /api/domain-auth/register with optionals name and namePrefix for user', async () => {
        //Given
        const dev = await insertDev()
        const domain = await insertDomain(dev.id)
        const { id: domainId } = domain
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /api/domain-auth/register')
          .spec()
          // When
          .post('/api/domain-auth/register')
          .withJson({ namePrefix: 'Me.', name: 'Name Less', email: 'name@less.com', domainId })
          // Then
          .expectBody('')
          .expectStatus(204)
          .toss()
        testCase.cleanup()
      })
      test('should respond 204 for POST /api/domain-auth/register with optional name for user', async () => {
        //Given
        const dev = await insertDev()
        const domain = await insertDomain(dev.id)
        const { id: domainId } = domain
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /api/domain-auth/register')
          .spec()
          // When
          .post('/api/domain-auth/register')
          .withJson({ name: 'Name Less', email: 'name@less.com', domainId })
          // Then
          .expectBody('')
          .expectStatus(204)
          .toss()
        testCase.cleanup()
      })
      test('should respond 400 for POST /api/domain-auth/register with invalid email', async () => {
        //Given
        const dev = await insertDev()
        const domain = await insertDomain(dev.id)
        const { id: domainId } = domain
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /api/domain-auth/register')
          .spec()
          // When
          .post('/api/domain-auth/register')
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
