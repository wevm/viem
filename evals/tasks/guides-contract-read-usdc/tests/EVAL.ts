import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { getTokenMetadata } from '../src/index.ts'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

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
})

test('reads USDC metadata from the fork', async () => {
  const metadata = await getTokenMetadata(client)
  expect(metadata.name).toBe('USD Coin')
  expect(metadata.symbol).toBe('USDC')
  expect(metadata.decimals).toBe(6)

  // totalSupply() selector, decoded from a raw eth_call at the pinned block.
  const raw = await rpc('eth_call', [
    { to: usdcAddress, data: '0x18160ddd' },
    'latest',
  ])
  expect(metadata.totalSupply).toBe(BigInt(raw))
  expect(metadata.totalSupply).toBeGreaterThan(0n)
})
