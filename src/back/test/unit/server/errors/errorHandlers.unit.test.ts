import { FastifyReply } from 'fastify'
import { requireFromBaseDir } from '../../../utils/jest-helper'

describe('backend tests', () => {
  describe('errorHandlers unit tests', () => {
    let module: {
      handlePrismaDevDuplicateError: (
        err: { code: string },
        reply: FastifyReply,
      ) => { code: string }
    }
    beforeAll(() => {
      module = requireFromBaseDir('src/back/main/server/errors/errorHandlers')
    })
    afterEach(() => {
      jest.resetAllMocks()
    })
    afterAll(() => {
      jest.restoreAllMocks()
    })
    describe('handlePrismaDuplicateError', () => {
      test('handlePrismaDuplicateError should return same error when code does not mean duplicate', () => {
        const expectedError = { code: 'unknown' }
        const reply = {} as FastifyReply
        const error = module.handlePrismaDevDuplicateError(expectedError, reply)
        expect(error).toBe(expectedError)
      })
    })
  })
})
