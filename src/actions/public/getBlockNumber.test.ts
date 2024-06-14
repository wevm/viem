import { beforeEach, expect, test, vi } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'

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
