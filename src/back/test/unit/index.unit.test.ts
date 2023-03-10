import { when } from 'jest-when'
import { ServerT } from '../../main/types/server'

import { doMockFromBaseDir, requireFromBaseDir } from '../utils/jest-helper'

describe('backend tests', () => {
  describe('index unit tests', () => {
    let setTimeoutMock: jest.SpyInstance
    let processExitMock: jest.SpyInstance
    let serverStart: jest.Mocked<ServerT['start']>
    let serverStop: jest.Mocked<ServerT['stop']>
    let main: { bootstrap: () => Promise<void> }
    beforeAll(() => {
      setTimeoutMock = jest.spyOn(global, 'setTimeout').mockImplementation()
      processExitMock = jest.spyOn(process, 'exit').mockImplementation()
      serverStart = jest.fn()
      serverStop = jest.fn()
      const Server = function (): ServerT {
        return {
          start: serverStart,
          stop: serverStop,
        } as ServerT
      }
      doMockFromBaseDir('src/back/main/server', () => ({ Server }))
      main = requireFromBaseDir('src/back/main')
    })
    beforeEach(() => {

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
        expect(serverStart).toHaveBeenNthCalledWith(1)
        expect(setTimeoutMock).not.toHaveBeenCalled()
        expect(processExitMock).not.toHaveBeenCalled()
      })
      test('should log and exit given failed to start the server', async () => {
        // Given
        const error = new Error('oops')
        when(serverStart).calledWith().mockRejectedValue(error)
        when(setTimeoutMock)
          .calledWith(expect.any(Function), 3000)
          .mockImplementation((callback) => {
            callback()
          })
        // When
        await main.bootstrap()
        // Then
        expect(serverStart).toHaveBeenNthCalledWith(1)
        expect(setTimeoutMock).toHaveBeenNthCalledWith(1, expect.any(Function), 3000)
      })
    })
  })
})
