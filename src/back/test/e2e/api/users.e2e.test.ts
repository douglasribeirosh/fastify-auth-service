import { hash } from 'bcryptjs'
import { e2e } from 'pactum'
import { int, string, uuid } from 'pactum-matchers'
import { getCurrentServer, getCurrentTestName, registerHooks } from '../utils/test-case'

describe('backend tests', () => {
  describe('backend server /api/users e2e tests', () => {
    describe('/api/users', () => {
      registerHooks()
      test('should respond unauthorized for GET /api/users/me', async () => {
        //Given
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('GET /api/users/me')
          .spec()
          // When
          .get('/api/users/me')
          // Then
          .expectStatus(401)
          .expectJson({
            code: 'FST_JWT_NO_AUTHORIZATION_IN_HEADER',
            error: 'Unauthorized',
            message: 'No Authorization was found in request.headers',
            statusCode: 401,
          })
          .toss()
        testCase.cleanup()
      })
      test('should respond user for GET /api/users/me with Authorization and Unauthorized after POST /auth/logout', async () => {
        const { prisma } = getCurrentServer()?.fastifyServer
        const passwordHash = await hash('P@ssw0rd', 10)
        await prisma.user.create({
          data: {
            name: 'name',
            email: 'some@email.com',
            username: 'login',
            passwordHash,
          },
        })
        //Given
        const testCase = e2e(getCurrentTestName())
        await testCase
          .step('POST /auth/login')
          .spec()
          .post('/auth/login')
          .withJson({ username: 'login', password: 'P@ssw0rd' })
          .expectStatus(200)
          .expectJsonMatch({
            token: string(),
          })
          .stores('Token', 'token')
          .toss()
        await testCase
          .step('GET /api/users/me')
          .spec()
          // When
          .withHeaders('Authorization', `Bearer $S{Token}`)
          .get('/api/users/me')
          // Then
          .expectStatus(200)
          .expectJsonMatch({
            iat: int(),
            id: uuid(),
            username: 'login',
          })
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
        await testCase
          .step('GET /api/users/me')
          .spec()
          // When
          .get('/api/users/me')
          .withHeaders('Authorization', `Bearer $S{Token}`)
          // Then
          .expectStatus(401)
          .expectJson({
            code: 401,
            error: 'Unauthorized',
          })
          .toss()
        testCase.cleanup()
      })
    })
  })
})
