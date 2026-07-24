import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, expectTypeOf, test } from 'vitest'
import { extendAppClient } from '../src/index.ts'

const baseClient = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})
const client = extendAppClient(baseClient)

async function rpc(method: string, params: unknown[]) {
  const res = await fetch('http://anvil:8545', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const { result, error } = (await res.json()) as any
  if (error) throw new Error(error.message)
  return result
}

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
}, 60_000)

test('health namespace reports node-derived values', async () => {
  const health = await client.health.check()
  const [rawBlockNumber, rawChainId] = await Promise.all([
    rpc('eth_blockNumber', []),
    rpc('eth_chainId', []),
  ])
  expect(typeof health.blockNumber).toBe('bigint')
  expect(health.blockNumber).toBe(BigInt(rawBlockNumber))
  expect(health.blockNumber).toBeGreaterThanOrEqual(24_000_000n)
  expect(health.blockNumber).toBeLessThan(24_001_000n)
  expect(health.chainId).toBe(Number(BigInt(rawChainId)))
  expect(health.chainId).toBe(1)
}, 60_000)

test('standard read methods are attached to the same client', async () => {
  expect(typeof client.block.getNumber).toBe('function')
  const blockNumber = await client.block.getNumber()
  expect(blockNumber).toBe(BigInt(await rpc('eth_blockNumber', [])))
}, 60_000)

test('preserves the base client type', () => {
  expectTypeOf(client.chain).toEqualTypeOf<typeof mainnet>()
}, 60_000)
