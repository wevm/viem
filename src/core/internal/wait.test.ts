import { describe, expect, test } from 'vitest'

import { wait } from './wait.js'

describe('wait', () => {
  test('resolves after the given time', async () => {
    await expect(wait(10)).resolves.toBeUndefined()
  })

  test('rejects when the signal is already aborted', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(wait(10, { signal: controller.signal })).rejects.toThrow()
  })

  test('does not resolve early for delays beyond the timer limit', async () => {
    const controller = new AbortController()
    const result = await Promise.race([
      wait(2 ** 31, { signal: controller.signal }).then(
        () => 'waited',
        () => 'aborted',
      ),
      wait(50).then(() => 'pending'),
    ])
    controller.abort()
    expect(result).toMatchInlineSnapshot(`"pending"`)
  })

  test('rejects when aborted while waiting', async () => {
    const controller = new AbortController()
    const promise = wait(10_000, { signal: controller.signal })
    controller.abort()
    await expect(promise).rejects.toThrow()
  })
})
