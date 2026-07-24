import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { counted, readBlockNumber } from '../src/index.ts'

const client = Client.create({
  cacheTime: 0,
  chain: mainnet,
  transport: counted({ transport: http('http://anvil:8545') }),
})

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('returns the block number and a cumulative request count', async () => {
  const first = await readBlockNumber(client)
  expect(typeof first.blockNumber).toBe('bigint')
  expect(first.blockNumber).toBeGreaterThanOrEqual(24_000_000n)
  expect(first.blockNumber).toBeLessThan(24_001_000n)
  expect(Number.isInteger(first.requestCount)).toBe(true)
  expect(first.requestCount).toBeGreaterThanOrEqual(2)

  const second = await readBlockNumber(client)
  expect(second.blockNumber).toBeGreaterThanOrEqual(first.blockNumber)
  expect(second.requestCount).toBeGreaterThanOrEqual(first.requestCount + 2)
})
