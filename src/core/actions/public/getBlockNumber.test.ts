import { describe, expect, test } from 'vitest'

import { anvilMainnet, getClient } from '~test/anvil.js'
import { Actions } from 'viem'

import { getBlockNumber } from './getBlockNumber.js'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('getBlockNumber', () => {
  test('default', async () => {
    expect(typeof (await getBlockNumber(getClient(anvilMainnet)))).toBe(
      'bigint',
    )
  })

  test('behavior: dedupes concurrent invocations', async () => {
    const client = getClient(anvilMainnet)
    const results = await Promise.all(
      Array.from({ length: 10 }, () => getBlockNumber(client)),
    )
    expect(new Set(results).size).toBe(1)
  })

  test('behavior: caches within cacheTime', async () => {
    const client = getClient(anvilMainnet)
    const a = await getBlockNumber(client, { cacheTime: 10_000 })
    await Actions.test.mine(client, { blocks: 1 })
    const b = await getBlockNumber(client, { cacheTime: 10_000 })
    expect(b).toBe(a)
  })

  test('behavior: cacheTime of 0 disables the cache', async () => {
    const client = getClient(anvilMainnet)
    const a = await getBlockNumber(client, { cacheTime: 10_000 })
    await Actions.test.mine(client, { blocks: 1 })
    const b = await getBlockNumber(client, { cacheTime: 0 })
    expect(b).toBeGreaterThan(a)
  })

  test('behavior: refetches after cacheTime expires', async () => {
    const client = getClient(anvilMainnet)
    const a = await getBlockNumber(client, { cacheTime: 1 })
    await Actions.test.mine(client, { blocks: 1 })
    await wait(5)
    const b = await getBlockNumber(client, { cacheTime: 1 })
    expect(b).toBeGreaterThan(a)
  })
})
