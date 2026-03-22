import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { wait } from './wait.js'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

test('wait: returns a promise', () => {
  const result = wait(100)
  expect(result).toBeInstanceOf(Promise)
})

test('wait: resolves after the specified time', async () => {
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
