import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { getLatestBlockNumber } from '../src/index.ts'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('returns the current block number', async () => {
  const value = await (async () => {
    let error: unknown
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await getLatestBlockNumber(client)
      } catch (err) {
        error = err
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }
    throw error
  })()
  expect(typeof value).toBe('bigint')
  expect(value).toBeGreaterThanOrEqual(24_000_000n)
  expect(value).toBeLessThan(24_001_000n)
}, 60_000)
