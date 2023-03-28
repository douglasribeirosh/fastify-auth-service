import { e2e } from 'pactum'
import { getCurrentTestName, registerHooks } from '../utils/test-case'

describe('backend tests', () => {
  describe('backend server /auth e2e tests', () => {
    describe('/auth/register', () => {
      registerHooks()
      test('should respond 204 for POST /auth/register with data but Error second time', async () => {
        //Given
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /auth/register')
          .spec()
          // When
          .post('/auth/register')
          .withJson({ name: 'Name Less', email: 'name@less.com', username: 'usernameless' })
          // Then
          .expectStatus(204)
          .expectBody('')
          .toss()
        await testCase
          .step('POST /auth/register second time')
          .spec()
          // When
          .post('/auth/register')
          .withJson({ name: 'Name Less', email: 'name@less.com', username: 'usernameless' })
          // Then
          .expectStatus(400)
          .expectJson({
            code: 400,
            error: 'Email or username already signed up',
          })
          .toss()
        testCase.cleanup()
      })
      test('should respond 400 for POST /auth/register with invalid email', async () => {
        //Given
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /auth/register')
          .spec()
          // When
          .post('/auth/register')
          .withJson({ name: 'Name Less', email: 'name', username: 'usernameless' })
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
