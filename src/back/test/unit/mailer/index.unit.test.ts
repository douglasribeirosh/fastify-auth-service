import { Mailer } from '../../../main/types/mailer'
import { defaultTestConfig } from '../../../main/config'
import { Config } from '../../../main/types/config'
import { requireFromBaseDir } from '../../utils/jest-helper'

describe('backend tests', () => {
  describe('index unit tests', () => {
    let module: { buildMailer: (config: Config) => Promise<Mailer> }
    beforeAll(() => {
      module = requireFromBaseDir('src/back/main/mailer')
    })
    afterEach(() => {
      jest.resetAllMocks()
    })
    afterAll(() => {
      jest.restoreAllMocks()
    })
    describe('buildMailer', () => {
      test('should successfully create mailer', async () => {
        // When
        const mailer: Mailer = await module.buildMailer(defaultTestConfig)
        // Then
        expect(mailer).toBeDefined()
      })
      test('should successfully create config when some env variable are set', async () => {
        // When
        const modifiedConfig = { ...defaultTestConfig, smtpUseTestAccount: false }
        const mailer: Mailer = await module.buildMailer(modifiedConfig)
        // Then
        expect(mailer).toBeDefined()
      })
    })
  })
})
