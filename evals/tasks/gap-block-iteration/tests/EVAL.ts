import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { collectBlockNumbers } from '../src/index.ts'

const client = Client.create({
  chain: mainnet,
  pollingInterval: 200,
  transport: http('http://anvil:8545'),
})

class RpcError extends Error {}

async function rpc(method: string, params: unknown[]) {
  // Retry transient network failures (socket closed under parallel load).
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch('http://anvil:8545', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      })
      const { result, error } = (await res.json()) as any
      if (error) throw new RpcError(error.message)
      return result
    } catch (error) {
      if (error instanceof RpcError || attempt >= 2) throw error
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }
}

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
}, 60_000)

test('consumes the block stream with for await', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/for\s+await/)
}, 60_000)

test('returns no blocks for non-positive counts', async () => {
  expect(await collectBlockNumbers(client, { count: 0 })).toEqual([])
  expect(await collectBlockNumbers(client, { count: -1 })).toEqual([])
}, 60_000)

test('collects the next 3 block numbers and terminates', async () => {
  const start = BigInt(await rpc('eth_blockNumber', []))
  // Advance the chain before the collector starts: every block it can
  // observe is strictly greater than `start`.
  await rpc('anvil_mine', ['0x1'])

  // Mine a block every 250ms in the background while the collector runs.
  let mining = true
  const miner = (async () => {
    while (mining) {
      await new Promise((resolve) => setTimeout(resolve, 250))
      await rpc('anvil_mine', ['0x1'])
    }
  })()

  try {
    const numbers = await collectBlockNumbers(client, { count: 3 })

    expect(numbers).toHaveLength(3)
    for (const number of numbers) {
      expect(typeof number).toBe('bigint')
      expect(number).toBeGreaterThan(start)
    }
    expect(numbers[1]!).toBeGreaterThan(numbers[0]!)
    expect(numbers[2]!).toBeGreaterThan(numbers[1]!)
  } finally {
    mining = false
    await miner
  }
}, 120_000)
