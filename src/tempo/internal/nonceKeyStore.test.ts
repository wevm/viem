import { expect, test, vi } from 'vitest'
import * as NonceKeyStore from './nonceKeyStore.js'

test('default', () => {
  const store = NonceKeyStore.create()
  const result = NonceKeyStore.getNonceKey(store, {
    address: '0x1234567890123456789012345678901234567890',
    chainId: 1,
  })
  expect(result).toBe(0n)
})

test('behavior: second call returns random value > 0n', () => {
  const store = NonceKeyStore.create()
  NonceKeyStore.getNonceKey(store, {
    address: '0x1234567890123456789012345678901234567890',
    chainId: 1,
  })
  const result = NonceKeyStore.getNonceKey(store, {
    address: '0x1234567890123456789012345678901234567890',
    chainId: 1,
  })
  expect(result).toBeGreaterThan(0n)
})

test('behavior: different addresses have independent counters', () => {
  const store = NonceKeyStore.create()

  const address1 = '0x1111111111111111111111111111111111111111'
  const address2 = '0x2222222222222222222222222222222222222222'
  const chainId = 1

  const result1 = NonceKeyStore.getNonceKey(store, {
    address: address1,
    chainId,
  })
  const result2 = NonceKeyStore.getNonceKey(store, {
    address: address2,
    chainId,
  })

  expect(result1).toBe(0n)
  expect(result2).toBe(0n)
})

test('behavior: different chainIds have independent counters', () => {
  const store = NonceKeyStore.create()

  const address = '0x1234567890123456789012345678901234567890'

  const result1 = NonceKeyStore.getNonceKey(store, { address, chainId: 1 })
  const result2 = NonceKeyStore.getNonceKey(store, { address, chainId: 2 })

  expect(result1).toBe(0n)
  expect(result2).toBe(0n)
})

test('behavior: same address+chainId shares counter', () => {
  const store = NonceKeyStore.create()

  const params = {
    address: '0x1234567890123456789012345678901234567890' as const,
    chainId: 1,
  }

  const result1 = NonceKeyStore.getNonceKey(store, params)
  const result2 = NonceKeyStore.getNonceKey(store, params)
  const result3 = NonceKeyStore.getNonceKey(store, params)

  expect(result1).toBe(0n)
  expect(result2).toBeGreaterThan(0n)
  expect(result3).toBeGreaterThan(0n)
})

test('behavior: reset clears counter for specific address+chainId', async () => {
  const store = NonceKeyStore.create()

  const params = {
    address: '0x1234567890123456789012345678901234567890' as const,
    chainId: 1,
  }

  // Get twice to increment counter
  NonceKeyStore.getNonceKey(store, params)
  NonceKeyStore.getNonceKey(store, params)

  // Wait for microtask to reset
  await new Promise((resolve) => queueMicrotask(() => resolve(undefined)))

  // Should start from 0n again
  const result = NonceKeyStore.getNonceKey(store, params)
  expect(result).toBe(0n)
})

test('behavior: reset only affects specific address+chainId', async () => {
  const store = NonceKeyStore.create()

  const params1 = {
    address: '0x1111111111111111111111111111111111111111' as const,
    chainId: 1,
  }
  const params2 = {
    address: '0x2222222222222222222222222222222222222222' as const,
    chainId: 1,
  }

  // Increment both counters
  NonceKeyStore.getNonceKey(store, params1) // 0n
  NonceKeyStore.getNonceKey(store, params1) // random

  // Wait for params1 reset
  await new Promise((resolve) => queueMicrotask(() => resolve(undefined)))

  // params1 should be reset
  expect(NonceKeyStore.getNonceKey(store, params1)).toBe(0n)

  // params2 should still be at first call
  expect(NonceKeyStore.getNonceKey(store, params2)).toBe(0n)
})

test('behavior: only schedules one reset per address+chainId', () => {
  const store = NonceKeyStore.create()

  const queueMicrotaskSpy = vi.spyOn(globalThis, 'queueMicrotask')
  const callCountBefore = queueMicrotaskSpy.mock.calls.length

  const params = {
    address: '0x1234567890123456789012345678901234567890' as const,
    chainId: 1,
  }

  // Multiple calls should only schedule one reset
  NonceKeyStore.getNonceKey(store, params)
  NonceKeyStore.getNonceKey(store, params)
  NonceKeyStore.getNonceKey(store, params)

  const callCountAfter = queueMicrotaskSpy.mock.calls.length
  expect(callCountAfter - callCountBefore).toBe(1)

  queueMicrotaskSpy.mockRestore()
})

test('behavior: schedules separate resets for different address+chainId combinations', () => {
  const store = NonceKeyStore.create()

  const queueMicrotaskSpy = vi.spyOn(globalThis, 'queueMicrotask')
  const callCountBefore = queueMicrotaskSpy.mock.calls.length

  NonceKeyStore.getNonceKey(store, {
    address: '0x1111111111111111111111111111111111111111',
    chainId: 1,
  })
  NonceKeyStore.getNonceKey(store, {
    address: '0x2222222222222222222222222222222222222222',
    chainId: 1,
  })
  NonceKeyStore.getNonceKey(store, {
    address: '0x1111111111111111111111111111111111111111',
    chainId: 2,
  })

  const callCountAfter = queueMicrotaskSpy.mock.calls.length
  expect(callCountAfter - callCountBefore).toBe(3) // Three different cache keys

  queueMicrotaskSpy.mockRestore()
})
