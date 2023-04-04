import { Config } from '../../../main/types/config'
import { deleteEnvVars } from '../../utils/env-utils'
import { requireFromBaseDir } from '../../utils/jest-helper'

describe('backend tests', () => {
  describe('index unit tests', () => {
    let dotenvConfig: jest.SpyInstance
    let config: { buildConfigFromEnv: () => Config }
    let dotenv: any
    beforeAll(() => {
      config = requireFromBaseDir('src/back/main/config')
      dotenv = require('dotenv')
    })
    beforeEach(() => {
      dotenvConfig = jest.spyOn(dotenv, 'config').mockImplementation()
    })
    afterEach(() => {
      jest.resetAllMocks()
    })
    afterAll(() => {
      if (dotenvConfig) {
        dotenvConfig.mockRestore()
      }
      jest.restoreAllMocks()
    })
    describe('buildConfigFromEnv', () => {
      test('should successfully create config from env', async () => {
        // When
        const configFromEnv = await config.buildConfigFromEnv()
        // Then
        expect(configFromEnv).toBeDefined()
      })
      test('should successfully create config when some env variable are set', async () => {
        process.env[`PORT`] = '33660'
        process.env[`REDIS_EXPIRE_SECONDS`] = '1'
        process.env[`SMTP_USE_TEST_ACCOUNT`] = 'false'
        process.env[`SMTP_PORT`] = '485'
        process.env[`DEV_INITIAL_DATA`] = 'true'
        // When
        const configFromEnv = await config.buildConfigFromEnv()
        // Then
        expect(configFromEnv).toBeDefined()
        deleteEnvVars()
      })
    })
  })
})
