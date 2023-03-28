import { randomUUID } from 'crypto'
import { e2e } from 'pactum'
import {
  REDIS_CONFIRM_KEY_PREFIX,
  REDIS_DOMAIN_KEY_PREFIX,
} from '../../../../main/common/constants'
import {
  getCurrentServer,
  getCurrentTestName,
  insertDev,
  insertDomain,
  insertUser,
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
        const user = await insertUser(domainId)
        const randomCode = Math.trunc(Math.random() * 1000000).toString()
        const randomKey = randomUUID()
        const redisKey = `${REDIS_DOMAIN_KEY_PREFIX}${domainId}:${REDIS_CONFIRM_KEY_PREFIX}${randomKey}#${randomCode}`
        const redisValue = `${user.id}`
        redis.setEx(redisKey, config.redisExpireSeconds, redisValue)
        //Given
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /api/domain-auth/confirm/:key')
          .spec()
          // When
          .post('/api/domain-auth/confirm/{key}')
          .withPathParams('key', randomKey)
          .withJson({
            domainId,
            code: randomCode,
            password: 'password',
            confirmPassword: 'password',
          })
          // Then
          .expectStatus(204)
          .expectBody('')
          .toss()
        testCase.cleanup()
        redis.del(randomKey)
      })
      test('should respond Error for POST /api/domain-auth/confirm/:key with not matching confirmPassword', async () => {
        const { redis, config } = getCurrentServer()?.fastifyServer
        const dev = await insertDev(false)
        const domain = await insertDomain(dev.id)
        const { id: domainId } = domain
        const user = await insertUser(domainId)
        const randomCode = Math.trunc(Math.random() * 1000000).toString()
        const randomKey = randomUUID()
        const redisKey = `${REDIS_DOMAIN_KEY_PREFIX}${domainId}:${REDIS_CONFIRM_KEY_PREFIX}${randomKey}#${randomCode}`
        const redisValue = `${user.id}`
        redis.setEx(redisKey, config.redisExpireSeconds, redisValue)
        //Given
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /api/domain-auth/confirm/:key')
          .spec()
          // When
          .post('/api/domain-auth/confirm/{key}')
          .withPathParams('key', randomKey)
          .withJson({
            domainId,
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
      test('should respond 400 for POST /api/domain-auth/confirm/:key with invalid payload', async () => {
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

                path: ['domainId'],
                received: 'undefined',
              },
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
