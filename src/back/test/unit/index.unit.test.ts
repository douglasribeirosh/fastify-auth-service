import { when } from 'jest-when'
import { ServerT } from '../../main/types/server'

import { doMockFromBaseDir, requireFromBaseDir } from '../utils/jest-helper'

describe('backend tests', () => {
  describe('index unit tests', () => {
    let setTimeoutMock: jest.SpyInstance
    let processExitMock: jest.SpyInstance
    let server: ServerT
    let serverWithError: ServerT
    let buildServer: () => ServerT
    let startServer: (server: ServerT) => Promise<void>
    let stopServer: (server: ServerT) => Promise<void>
    let main: { bootstrap: () => Promise<void> }
    beforeAll(() => {
      server = {} as ServerT
      serverWithError = {} as ServerT
      buildServer = jest.fn(() => server)
      startServer = jest.fn()
      stopServer = jest.fn()
      doMockFromBaseDir('src/back/main/server', () => ({ buildServer, startServer, stopServer }))
      main = requireFromBaseDir('src/back/main')
    })
    beforeEach(() => {
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
