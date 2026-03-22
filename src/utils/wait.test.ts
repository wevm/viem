import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { wait } from './wait.js'

describe('wait', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('returns a promise', () => {
    const result = wait(100)
    expect(result).toBeInstanceOf(Promise)
  })

  test('resolves after the specified time', async () => {
    let resolved = false
    const promise = wait(1000).then(() => {
      resolved = true
    })

    expect(resolved).toBe(false)

    await vi.advanceTimersByTimeAsync(999)
    expect(resolved).toBe(false)

    await vi.advanceTimersByTimeAsync(1)
    expect(resolved).toBe(true)

    await promise
  })
})
