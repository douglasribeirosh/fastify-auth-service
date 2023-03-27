import { hash } from 'bcryptjs'
import { randomUUID } from 'crypto'
import { e2e } from 'pactum'
import { string } from 'pactum-matchers'
import { REDIS_CONFIRM_KEY_PREFIX } from '../../main/common/constants'
import { getCurrentServer, getCurrentTestName, insertUser, registerHooks } from './utils/test-case'

describe('backend tests', () => {
  describe('backend server /auth e2e tests', () => {
    describe('/auth', () => {
      registerHooks()
      test('should respond token for POST /auth/login and be able to POST /auth/logout with token', async () => {
        //Given
        await insertUser(true)
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /auth/login')
          .spec()
          // When
          .post('/auth/login')
          .withJson({ username: 'login', password: 'P@ssw0rd' })
          // Then
          .expectStatus(200)
          .expectJsonMatch({
            token: string(),
          })
          .stores('Token', 'token')
          .toss()
        await testCase
          .step('POST /auth/logout')
          .spec()
          // When
          .post('/auth/logout')
          .withHeaders('Authorization', `Bearer $S{Token}`)
          .withJson({})
          // Then
          .expectStatus(400)
          .toss()
        await testCase
          .step('POST /auth/logout')
          .spec()
          // When
          .post('/auth/logout')
          .withHeaders('Authorization', `Bearer $S{Token}`)
          // Then
          .expectStatus(204)
          .expectBody('')
          .toss()
        testCase.cleanup()
      })
      test('should respond 400 for POST /auth/login with invalid data', async () => {
        //Given
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /auth/login with invalid data')
          .spec()
          // When
          .post('/auth/login')
          .withJson({ username: 'login' })
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
                  path: ['password'],
                  received: 'undefined',
                },
              ],
              name: 'ZodError',
            },
          })
          .toss()
        testCase.cleanup()
      })
      test('should respond 401 for POST /auth/login with unauthorized data', async () => {
        //Given
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /auth/login with invalid data')
          .spec()
          // When
          .post('/auth/login')
          .withJson({ username: 'login', password: 'P@ssw0rd' })
          // Then
          .expectStatus(401)
          .expectJson({
            code: 401,
            error: 'Unauthorized',
          })
          .toss()
        testCase.cleanup()
      })
      test('should respond 400 for POST /auth/login with invalid data', async () => {
        //Given
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /auth/login with invalid data')
          .spec()
          // When
          .post('/auth/login')
          .withJson({ username: 'login' })
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
                  path: ['password'],
                  received: 'undefined',
                },
              ],
              name: 'ZodError',
            },
          })
          .toss()
        testCase.cleanup()
      })
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
      test('should respond 204 for POST /auth/reset-pass with data', async () => {
        //Given
        await insertUser()
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /auth/reset-pass')
          .spec()
          // When
          .post('/auth/reset-pass')
          .withJson({ email: 'name@less.com' })
          // Then
          .expectStatus(204)
          .expectBody('')
          .toss()
        testCase.cleanup()
      })
      test('should respond 400 for POST /auth/reset-pass with invalid email', async () => {
        //Given
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /auth/reset-pass')
          .spec()
          // When
          .post('/auth/reset-pass')
          .withJson({ email: 'name' })
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
      test('should respond 404 for POST /auth/reset-pass with not existing email', async () => {
        //Given
        await insertUser()
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /auth/reset-pass')
          .spec()
          // When
          .post('/auth/reset-pass')
          .withJson({ email: 'anothername@less.com' })
          // Then
          .expectStatus(404)
          .expectJson({
            code: 404,
            error: 'User not found',
          })
          .toss()
        testCase.cleanup()
      })
      test('should respond 204 for POST /auth/confirm/:key with data', async () => {
        const { redis, config } = getCurrentServer()?.fastifyServer
        const user = await insertUser(false)
        const randomCode = Math.trunc(Math.random() * 1000000).toString()
        const randomKey = randomUUID()
        const redisKey = `${REDIS_CONFIRM_KEY_PREFIX}${randomKey}#${randomCode}`
        const redisValue = `${user.id}`
        redis.setEx(redisKey, config.redisExpireSeconds, redisValue)
        //Given
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /auth/confirm/:key')
          .spec()
          // When
          .post('/auth/confirm/{key}')
          .withPathParams('key', randomKey)
          .withJson({ code: randomCode, password: 'password', confirmPassword: 'password' })
          // Then
          .expectStatus(204)
          .expectBody('')
          .toss()
        testCase.cleanup()
        redis.del(randomKey)
      })
      test('should respond Error for POST /auth/confirm/:key with not matching confirmPassword', async () => {
        const { redis, config } = getCurrentServer()?.fastifyServer
        const user = await insertUser(false)
        const randomCode = Math.trunc(Math.random() * 1000000).toString()
        const randomKey = randomUUID()
        const redisKey = `${REDIS_CONFIRM_KEY_PREFIX}${randomKey}#${randomCode}`
        const redisValue = `${user.id}`
        redis.setEx(redisKey, config.redisExpireSeconds, redisValue)
        //Given
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /auth/confirm/:key')
          .spec()
          // When
          .post('/auth/confirm/{key}')
          .withPathParams('key', randomKey)
          .withJson({ code: randomCode, password: 'password', confirmPassword: 'passwor' })
          // Then
          .expectStatus(400)
          .expectBody({ code: 400, error: 'Error when confirming password or code' })
          .toss()
        testCase.cleanup()
        redis.del(randomKey)
      })
      test('should respond 400 for POST /auth/confirm/:key with invalid payload', async () => {
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
          .step('POST /auth/confirm/:key')
          .spec()
          // When
          .post('/auth/confirm/{key}')
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
