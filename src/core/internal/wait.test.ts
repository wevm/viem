import { describe, expect, test, vi } from 'vp/test'

import { wait } from './wait.js'

describe('wait', () => {
  test('behavior: resolves after timeout', async () => {
    vi.useFakeTimers()
    const promise = wait(100)

    await vi.advanceTimersByTimeAsync(100)
    const result = await promise

    expect(result).toMatchInlineSnapshot(`undefined`)
    vi.useRealTimers()
  })

  test('behavior: rejects when already aborted', async () => {
    const controller = new AbortController()
    controller.abort(new Error('boom'))

    const error = await wait(100, { signal: controller.signal }).catch(
      (error) => error,
    )

    expect(error).toMatchInlineSnapshot(`[Error: boom]`)
  })

  test('behavior: rejects when aborted during timeout', async () => {
    vi.useFakeTimers()
    const controller = new AbortController()
    const promise = wait(100, { signal: controller.signal }).catch(
      (error) => error,
    )

    controller.abort(new Error('boom'))
    const error = await promise
    await vi.advanceTimersByTimeAsync(100)

    expect(error).toMatchInlineSnapshot(`[Error: boom]`)
    vi.useRealTimers()
  })
})
