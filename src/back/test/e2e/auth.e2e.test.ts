import { randomUUID } from 'crypto'
import { e2e } from 'pactum'
import { string } from 'pactum-matchers'
import { getCurrentServer, getCurrentTestName, registerHooks } from './utils/test-case'

describe('backend tests', () => {
  describe('backend server /auth e2e tests', () => {
    describe('/auth', () => {
      registerHooks()
      test('should respond token for POST /auth/token', async () => {
        const { prisma } = getCurrentServer()?.fastifyServer
        await prisma.user.create({
          data: {
            name: 'name',
            email: 'some@email.com',
            username: 'login',
            password: 'P@ssw0rd',
          },
        })
        //Given
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /auth/token')
          .spec()
          // When
          .post('/auth/token')
          .withJson({ username: 'login', password: 'P@ssw0rd' })
          // Then
          .expectStatus(200)
          .expectJsonMatch({
            token: string(),
          })
          .toss()
        testCase.cleanup()
      })
      test('should respond 204 for POST /auth/signup with data', async () => {
        //Given
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /auth/signup')
          .spec()
          // When
          .post('/auth/signup')
          .withJson({ name: 'Name Less', email: 'name@less.com', username: 'usernameless' })
          // Then
          .expectStatus(204)
          .expectBody('')
          .toss()
        testCase.cleanup()
      })
      test('should respond 400 for POST /auth/signup with invalid email', async () => {
        //Given
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /auth/signup')
          .spec()
          // When
          .post('/auth/signup')
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
      test('should respond 204 for POST /auth/signup/confirm/:key with data', async () => {
        const { prisma, redis, config } = getCurrentServer()?.fastifyServer
        const user = await prisma.user.create({
          data: {
            name: 'name',
            email: 'some@email.com',
            username: 'username',
          },
        })
        const randomCode = Math.trunc(Math.random() * 1000000).toString()
        const randomKey = randomUUID()
        const redisKey = `${randomKey}#${randomCode}`
        const redisValue = `${user.id}`
        redis.setEx(redisKey, config.redisExpireSeconds, redisValue)
        //Given
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /auth/signup/confirm/:key')
          .spec()
          // When
          .post('/auth/signup/confirm/{key}')
          .withPathParams('key', randomKey)
          .withJson({ code: randomCode, password: 'password', confirmPassword: 'password' })
          // Then
          .expectStatus(204)
          .expectBody('')
          .toss()
        testCase.cleanup()
        redis.del(randomKey)
      })
      test('should respond 400 for POST /auth/signup/confirm/:key with invalid payload', async () => {
        const randomKey = randomUUID()
        //Given
        const testCase = e2e(getCurrentTestName())
        const expectedError = {
          code: 400,
          error: {
            issues: [
              {
                code: 'invalid_type',
                expected: 'string',
                message: 'Required',
                path: ['code'],
                received: 'undefined',
              },
              {
                code: 'invalid_type',
                expected: 'string',
                message: 'Required',
                path: ['password'],
                received: 'undefined',
              },
              {
                code: 'invalid_type',
                expected: 'string',
                message: 'Required',
                path: ['confirmPassword'],
                received: 'undefined',
              },
            ],
            name: 'ZodError',
          },
        }
        await testCase
          .step('POST /auth/signup/confirm/:key')
          .spec()
          // When
          .post('/auth/signup/confirm/{key}')
          .withPathParams('key', randomKey)
          .withJson({})
          // Then
          .expectStatus(400)
          .expectJson(expectedError)
          .toss()
        testCase.cleanup()
      })
    })
  })
})
