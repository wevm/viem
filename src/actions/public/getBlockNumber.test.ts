import { beforeEach, expect, test, vi } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { mine } from '../test/mine.js'
import { getBlockNumber, getBlockNumberCache } from './getBlockNumber.js'

const client = anvilMainnet.getClient()

beforeEach(() => getBlockNumberCache(client.uid).clear())

test('default', async () => {
  expect(await getBlockNumber(client)).toBeDefined()
})

test('behavior: multiple invocations only called once', async () => {
  const request = vi.spyOn(client, 'request')
  await Promise.all(Array.from({ length: 10 }, () => getBlockNumber(client)))
  expect(request).toBeCalledTimes(1)
})

test('behavior: caches', async () => {
  const request = vi.spyOn(client, 'request')
  const a = await getBlockNumber(client)
  const b = await getBlockNumber(client)
  expect(a).toBe(b)
  expect(request).toBeCalledTimes(1)
})

test('behavior: caches blockNumber within cacheTime', async () => {
  const cacheTime = 100
  vi.useFakeTimers()

  const a = await getBlockNumber(client, { cacheTime })
  mine(client, { blocks: 1 })

  vi.advanceTimersByTime(cacheTime / 2)
  const b = await getBlockNumber(client)
  // Within cacheTime, the block number should be the same
  expect(a).toBe(b)

  // Advance time by the remaining half plus 1ms to ensure the cache is invalidated
  vi.advanceTimersByTime(1 + cacheTime / 2)
  const c = await getBlockNumber(client)
  // After cacheTime has passed, the block number should be different
  expect(a).not.toBe(c)

  vi.useRealTimers()
})
