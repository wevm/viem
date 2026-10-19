import { Store } from 'viem/tempo'
import { expect, test } from 'vitest'
import { memoize, scoped } from './cache.js'

test('preserves bigint values and strings that resemble codec tags', async () => {
  const store = Store.memory()
  const options = { key: 'metadata', store, ttl: 60_000 }
  const value = { amount: 123n, label: 'viem:relay:cache:bigint:123' }
  await memoize(async () => value, options)
  expect(
    await memoize(async () => ({ amount: 456n, label: 'refreshed' }), options),
  ).toEqual(value)
})

test('refreshes expired and malformed entries', async () => {
  const store = Store.memory()
  await memoize(async () => 'expired', { key: 'entry', store, ttl: 0 })
  expect(
    await memoize(async () => 'fresh', { key: 'entry', store, ttl: 60_000 }),
  ).toBe('fresh')
  await store.setItem('viem:relay:cache:entry', '{malformed')
  expect(
    await memoize(async () => 'repaired', { key: 'entry', store, ttl: 60_000 }),
  ).toBe('repaired')
})

test('deduplicates cache misses within a request', async () => {
  const store = scoped(Store.memory())!
  const options = { key: 'entry', store, ttl: 60_000 }
  const [first, second] = await Promise.all([
    memoize(async () => crypto.randomUUID(), options),
    memoize(async () => crypto.randomUUID(), options),
  ])
  expect(first).toBe(second)
})

test('isolates in-flight reads between requests sharing persistent storage', async () => {
  const store = Store.memory()
  const options = { key: 'entry', ttl: 60_000 }
  const [first, second] = await Promise.all([
    memoize(async () => crypto.randomUUID(), {
      ...options,
      store: scoped(store)!,
    }),
    memoize(async () => crypto.randomUUID(), {
      ...options,
      store: scoped(store)!,
    }),
  ])
  expect(first).not.toBe(second)
})
