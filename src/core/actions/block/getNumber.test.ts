import { expect, test } from 'vitest'

import * as anvil from '~test/anvil.js'
import { Actions } from 'viem'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

test('default', async () => {
  expect(
    typeof (await Actions.block.getNumber(anvil.getClient(anvil.mainnet))),
  ).toBe('bigint')
})

test('behavior: dedupes concurrent invocations', async () => {
  const client = anvil.getClient(anvil.mainnet)
  const results = await Promise.all(
    Array.from({ length: 10 }, () => Actions.block.getNumber(client)),
  )
  expect(new Set(results).size).toBe(1)
})

test('behavior: caches within cacheTime', async () => {
  const client = anvil.getClient(anvil.mainnet)
  const a = await Actions.block.getNumber(client, { cacheTime: 10_000 })
  await Actions.block.mine(client, { blocks: 1 })
  const b = await Actions.block.getNumber(client, { cacheTime: 10_000 })
  expect(b).toBe(a)
})

test('behavior: cacheTime of 0 disables the cache', async () => {
  const client = anvil.getClient(anvil.mainnet)
  const a = await Actions.block.getNumber(client, { cacheTime: 10_000 })
  await Actions.block.mine(client, { blocks: 1 })
  const b = await Actions.block.getNumber(client, { cacheTime: 0 })
  expect(b).toBeGreaterThan(a)
})

test('behavior: refetches after cacheTime expires', async () => {
  const client = anvil.getClient(anvil.mainnet)
  const a = await Actions.block.getNumber(client, { cacheTime: 1 })
  await Actions.block.mine(client, { blocks: 1 })
  await wait(5)
  const b = await Actions.block.getNumber(client, { cacheTime: 1 })
  expect(b).toBeGreaterThan(a)
})
