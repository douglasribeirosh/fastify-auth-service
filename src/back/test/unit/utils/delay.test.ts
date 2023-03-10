import delay from "../../../main/utils/delay"

describe('delay', () => {
  beforeAll(async () => {
    jest.useFakeTimers()
  })
  test('should wait for 2s and execute function', () => {
    // Given
    const durationMs = 2000
    const doSomething = jest.fn()
    // When
    delay(durationMs, doSomething)
    // Then
    expect(doSomething).toHaveBeenCalledTimes(0)
    jest.advanceTimersByTime(durationMs);
    expect(doSomething).toHaveBeenCalledTimes(1)
  })
})
