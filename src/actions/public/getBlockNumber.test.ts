import { beforeEach, expect, test, vi } from 'vitest'

import { publicClient } from '../../_test/index.js'

import { getBlockNumber, getBlockNumberCache } from './getBlockNumber.js'

beforeEach(() => getBlockNumberCache(publicClient.uid).clear())

test('default', async () => {
  expect(await getBlockNumber(publicClient)).toBeDefined()
})

test('behavior: multiple invocations only called once', async () => {
  const request = vi.spyOn(publicClient, 'request')
  await Promise.all(
    Array.from({ length: 10 }, () => getBlockNumber(publicClient)),
  )
  expect(request).toBeCalledTimes(1)
})

test('behavior: caches', async () => {
  const request = vi.spyOn(publicClient, 'request')
  const a = await getBlockNumber(publicClient)
  const b = await getBlockNumber(publicClient)
  expect(a).toBe(b)
  expect(request).toBeCalledTimes(1)
})
