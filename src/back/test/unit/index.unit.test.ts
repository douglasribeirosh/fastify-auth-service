import { when } from 'jest-when'
import { defaultTestConfig } from '../../main/config'
import { Config } from '../../main/types/config'
import { ServerT } from '../../main/types/server'

import { doMockFromBaseDir, requireFromBaseDir } from '../utils/jest-helper'

describe('backend tests', () => {
  describe('index unit tests', () => {
    let setTimeoutMock: jest.SpyInstance
    let processExitMock: jest.SpyInstance
    let dotenvConfig: jest.SpyInstance
    let server: ServerT
    let serverWithError: ServerT
    let buildServer: () => ServerT
    let startServer: (server: ServerT) => Promise<void>
    let stopServer: (server: ServerT) => Promise<void>
    let buildConfigFromEnv: () => Config
    let main: { bootstrap: () => Promise<void> }
    let dotenv: any
    beforeAll(() => {
      server = {} as ServerT
      serverWithError = {} as ServerT
      buildServer = jest.fn(() => server)
      startServer = jest.fn()
      stopServer = jest.fn()
      buildConfigFromEnv = () => defaultTestConfig
      doMockFromBaseDir('src/back/main/server', () => ({ buildServer, startServer, stopServer }))
      main = requireFromBaseDir('src/back/main')
      dotenv = require('dotenv')
    })
    beforeEach(() => {
      dotenvConfig = jest.spyOn(dotenv, 'config').mockImplementation()
      setTimeoutMock = jest.spyOn(global, 'setTimeout').mockImplementation()
      processExitMock = jest.spyOn(process, 'exit').mockImplementation()
    })
    afterEach(() => {
      jest.resetAllMocks()
    })
    afterAll(() => {
      if (processExitMock) {
        processExitMock.mockRestore()
      }
      if (setTimeoutMock) {
        setTimeoutMock.mockRestore()
      }
      if (dotenvConfig) {
        dotenvConfig.mockRestore()
      }
      jest.restoreAllMocks()
    })
    describe('bootstrap', () => {
      test('should successfully create and run the server', async () => {
        // When
        await main.bootstrap()
        // Then
        expect(startServer).toHaveBeenNthCalledWith(1, server)
        expect(setTimeoutMock).not.toHaveBeenCalled()
        expect(processExitMock).not.toHaveBeenCalled()
      })
      test('should log and exit given failed to start the server', async () => {
        when(buildServer).mockImplementation(() => serverWithError)
        // Given
        const error = new Error('oops')
        when(startServer).calledWith(serverWithError).mockRejectedValue(error)
        when(setTimeoutMock)
          .calledWith(expect.any(Function), 3000)
          .mockImplementation((callback) => {
            callback()
          })
        // When
        await main.bootstrap()
        // Then
        expect(startServer).toHaveBeenNthCalledWith(1, serverWithError)
        expect(setTimeoutMock).toHaveBeenNthCalledWith(1, expect.any(Function), 3000)
      })
    })
  })
})
