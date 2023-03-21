import { FastifyBaseLogger } from 'fastify'
import { Config } from '../../../main/types/config'
import { FastifyT } from '../../../main/types/server'

import { requireFromBaseDir } from '../../utils/jest-helper'

describe('backend tests', () => {
  describe('index unit tests', () => {
    let module: {
      onRedisError: (log: FastifyBaseLogger) => (err: Error) => void
      onFastifyError: (fastify: FastifyT) => (err: Error) => void
    }
    beforeAll(() => {
      module = requireFromBaseDir('src/back/main/server')
    })
    afterEach(() => {
      jest.resetAllMocks()
    })
    afterAll(() => {
      jest.restoreAllMocks()
    })
    describe('buildServer', () => {
      test('redisError should be convered when error happens', () => {
        const error = jest.fn()
        const log = { error } as unknown as FastifyBaseLogger
        module.onRedisError(log)({ name: 'Error', message: 'Error message' })
        expect(error).toBeCalled()
      })
      test('onFastifyError should be convered when error happens', () => {
        const trace = jest.fn()
        const error = jest.fn()
        const fastify = { log: { trace, error } } as FastifyT
        module.onFastifyError(fastify)({ name: 'Error', message: 'Error message' })
        expect(trace).not.toBeCalled()
        expect(error).toBeCalled()
      })
    })
  })
})
