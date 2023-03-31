import { randomUUID } from 'crypto'
import { e2e } from 'pactum'
import {
  REDIS_CONFIRM_KEY_PREFIX,
  REDIS_DOMAIN_KEY_PREFIX,
} from '../../../../main/common/constants'
import {
  getCurrentServer,
  getCurrentTestName,
  insertClient,
  insertDev,
  insertDomain,
  insertUser,
  loginClient,
  registerHooks,
} from '../../utils/test-case'

describe('backend tests', () => {
  describe('backend server /api/domain-auth e2e tests', () => {
    describe('/api/domain-auth/confirm', () => {
      registerHooks()
      test('should respond 204 for POST /api/domain-auth/confirm/:key with data', async () => {
        const { redis, config } = getCurrentServer()?.fastifyServer
        const dev = await insertDev(false)
        const domain = await insertDomain(dev.id)
        const { id: domainId } = domain
        const client = await insertClient(domainId)
        const user = await insertUser(domainId)
        const randomCode = Math.trunc(Math.random() * 1000000).toString()
        const randomKey = randomUUID()
        const redisKey = `${REDIS_DOMAIN_KEY_PREFIX}${domainId}:${REDIS_CONFIRM_KEY_PREFIX}${randomKey}#${randomCode}`
        const redisValue = `${user.id}`
        redis.setEx(redisKey, config.redisExpireSeconds, redisValue)
        //Given
        const testCase = e2e(getCurrentTestName())
        await loginClient(testCase, { domainId, id: client.id, secret: client.secret })
        await testCase
          .step('POST /api/domain-auth/confirm/:key')
          .spec()
          // When
          .post('/api/domain-auth/confirm/{key}')
          .withPathParams('key', randomKey)
          .withHeaders('AuthorizationClient', `Bearer $S{ClientToken}`)
          .withJson({
            code: randomCode,
            password: 'password',
            confirmPassword: 'password',
          })
          // Then
          .expectStatus(204)
          .expectBody('')
          .toss()
        redis.del(randomKey)
      })
      test('should respond Error for POST /api/domain-auth/confirm/:key with not matching confirmPassword', async () => {
        const { redis, config } = getCurrentServer()?.fastifyServer
        const dev = await insertDev(false)
        const domain = await insertDomain(dev.id)
        const { id: domainId } = domain
        const client = await insertClient(domainId)
        const user = await insertUser(domainId)
        const randomCode = Math.trunc(Math.random() * 1000000).toString()
        const randomKey = randomUUID()
        const redisKey = `${REDIS_DOMAIN_KEY_PREFIX}${domainId}:${REDIS_CONFIRM_KEY_PREFIX}${randomKey}#${randomCode}`
        const redisValue = `${user.id}`
        redis.setEx(redisKey, config.redisExpireSeconds, redisValue)
        //Given
        const testCase = e2e(getCurrentTestName())
        await loginClient(testCase, { domainId, id: client.id, secret: client.secret })
        await testCase
          .step('POST /api/domain-auth/confirm/:key')
          .spec()
          // When
          .post('/api/domain-auth/confirm/{key}')
          .withPathParams('key', randomKey)
          .withHeaders('AuthorizationClient', `Bearer $S{ClientToken}`)
          .withJson({
            code: randomCode,
            password: 'password',
            confirmPassword: 'passwor',
          })
          // Then
          .expectStatus(400)
          .expectBody({ code: 400, error: 'Error when confirming password or code' })
          .toss()
        testCase.cleanup()
        redis.del(randomKey)
      })
      test('should respond 401 for POST /api/domain-auth/confirm/:key without client being logged in', async () => {
        const randomKey = randomUUID()
        //Given
        const testCase = e2e(getCurrentTestName())
        const expectedError = {
          code: 401,
          error: 'Unauthorized',
        }
        await testCase
          .step('POST /api/domain-auth/confirm/:key')
          .spec()
          // When
          .post('/api/domain-auth/confirm/{key}')
          .withPathParams('key', randomKey)
          .withJson({})
          // Then
          .expectStatus(401)
          .expectJson(expectedError)
          .toss()
        const expectedError1 = {
          code: 'FST_JWT_AUTHORIZATION_TOKEN_INVALID',
          error: 'Unauthorized',
          message: 'Authorization token is invalid: The token is malformed.',
          statusCode: 401,
        }
        await testCase
          .step('POST /api/domain-auth/confirm/:key')
          .spec()
          // When
          .post('/api/domain-auth/confirm/{key}')
          .withPathParams('key', randomKey)
          .withHeaders('AuthorizationClient', `Bearer wrongToken`)
          .withJson({})
          // Then
          .expectStatus(401)
          .expectJson(expectedError1)
          .toss()
        testCase.cleanup()
      })
      test('should respond 400 for POST /api/domain-auth/confirm/:key with invalid payload', async () => {
        const dev = await insertDev(false)
        const domain = await insertDomain(dev.id)
        const { id: domainId } = domain
        const client = await insertClient(domainId)
        const randomKey = randomUUID()
        //Given
        const testCase = e2e(getCurrentTestName())
        await loginClient(testCase, { domainId, id: client.id, secret: client.secret })
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
          .step('POST /api/domain-auth/confirm/:key')
          .spec()
          // When
          .post('/api/domain-auth/confirm/{key}')
          .withPathParams('key', randomKey)
          .withHeaders('AuthorizationClient', `Bearer $S{ClientToken}`)
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
