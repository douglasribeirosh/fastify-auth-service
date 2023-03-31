import { JWT } from '@fastify/jwt'
import { FastifyReply } from 'fastify'
import { doMockFromBaseDir, requireFromBaseDir } from '../../utils/jest-helper'

describe('backend tests', () => {
  describe('authenticateClient unit tests', () => {
    let module: {
      decode: (token: string, jwt: JWT, reply: FastifyReply) => { code: string }
    }
    let replyUnauthorizedError: () => Promise<{ code: number; error: string }>
    beforeAll(() => {
      replyUnauthorizedError = jest.fn(async () => ({ code: 401, error: 'Unauthorized' }))
      doMockFromBaseDir('src/back/main/server/errors/httpErrors', () => ({
        replyUnauthorizedError,
      }))
      module = requireFromBaseDir('src/back/main/fastify-plugins/authenticateClient')
    })
    beforeEach(() => {})
    afterEach(() => {
      jest.resetAllMocks()
    })
    afterAll(() => {
      jest.restoreAllMocks()
    })
    describe('decode', () => {
      test('decode should throw error when jwt decode returns null', async () => {
        const token = ''
        const jwt = { decode: jest.fn(() => Promise.resolve(null)) } as unknown as JWT
        const reply = { code: jest.fn() } as unknown as FastifyReply
        let thrownError: unknown
        try {
          await module.decode(token, jwt, reply)
        } catch (err) {
          thrownError = err
        }
        expect(thrownError).toStrictEqual({ code: 401, error: 'Unauthorized' })
      })
    })
  })
})
