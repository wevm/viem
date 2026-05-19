import { afterEach, describe, expect, test, vi } from 'vp/test'

import { poll } from './poll.js'

afterEach(() => {
  vi.useRealTimers()
})

describe('poll', () => {
  test('behavior: polls on the interval', async () => {
    vi.useFakeTimers()
    const fn = vi.fn(async () => {})
    const unpoll = poll(fn, { interval: 100 })

    await vi.advanceTimersByTimeAsync(350)
    unpoll()

    expect(fn).toHaveBeenCalledTimes(3)
  })

  test('behavior: emits on begin', async () => {
    vi.useFakeTimers()
    const fn = vi.fn(async () => 'wagmi')
    const unpoll = poll(fn, { emitOnBegin: true, interval: 100 })

    await vi.advanceTimersByTimeAsync(250)
    unpoll()

    expect(fn).toHaveBeenCalledTimes(3)
  })

  test('behavior: uses initial wait time', async () => {
    vi.useFakeTimers()
    const fn = vi.fn(async () => 'wagmi')
    const initialWaitTime = vi.fn(async (data: string | void) => {
      expect(data).toMatchInlineSnapshot(`"wagmi"`)
      return 200
    })
    const unpoll = poll(fn, {
      emitOnBegin: true,
      initialWaitTime,
      interval: 100,
    })

    await vi.advanceTimersByTimeAsync(150)
    expect(fn).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(100)
    unpoll()

    expect(fn).toHaveBeenCalledTimes(2)
    expect(initialWaitTime).toHaveBeenCalledTimes(1)
  })

  test('behavior: stops polling via returned function', async () => {
    vi.useFakeTimers()
    const fn = vi.fn(async () => {})
    const unpoll = poll(fn, { interval: 100 })

    await vi.advanceTimersByTimeAsync(250)
    unpoll()
    await vi.advanceTimersByTimeAsync(250)

    expect(fn).toHaveBeenCalledTimes(2)
  })

  test('behavior: stops polling via callback', async () => {
    vi.useFakeTimers()
    const fn = vi.fn(async ({ unpoll }) => {
      if (fn.mock.calls.length === 2) unpoll()
    })
    poll(fn, { interval: 100 })

    await vi.advanceTimersByTimeAsync(500)

    expect(fn).toHaveBeenCalledTimes(2)
  })
})
