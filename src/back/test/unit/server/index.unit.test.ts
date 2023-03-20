import { Config } from '../../../main/types/config'

import { requireFromBaseDir } from '../../utils/jest-helper'

describe('backend tests', () => {
  describe('index unit tests', () => {
    let module: { redisError: (err: Error) => void }
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
      test('should fail connecting to redis when invalid connection url', () => {
        module.redisError({ name: 'Error', message: 'Error message' })
      })
    })
  })
})
