import { readFileSync } from 'node:fs'
import { Client } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { createTransport, getBlockNumber } from '../src/index.ts'

const deadFirstClient = Client.create({
  chain: mainnet,
  transport: createTransport({
    urls: ['http://anvil:1', 'http://anvil:8545'],
  }),
})
const liveFirstClient = Client.create({
  chain: mainnet,
  transport: createTransport({
    urls: ['http://anvil:8545', 'http://anvil:1'],
  }),
})

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('serves the request when the first endpoint is dead', async () => {
  const value = await getBlockNumber(deadFirstClient)
  expect(typeof value).toBe('bigint')
  expect(value).toBeGreaterThanOrEqual(24_000_000n)
  expect(value).toBeLessThan(24_001_000n)
}, 60_000)

test('serves the request when the first endpoint is healthy', async () => {
  const value = await getBlockNumber(liveFirstClient)
  expect(typeof value).toBe('bigint')
  expect(value).toBeGreaterThanOrEqual(24_000_000n)
  expect(value).toBeLessThan(24_001_000n)
})
