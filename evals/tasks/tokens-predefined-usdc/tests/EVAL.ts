import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { getUsdcAddress, getUsdcMetadata } from '../src/index.ts'

const canonical = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('resolves the address from the bundled definitions, not a literal', () => {
  const src = readFileSync('src/index.ts', 'utf8')
  expect(src).toMatch(/from ['"]viem\/tokens['"]/)
  expect(src.toLowerCase()).not.toContain(canonical.toLowerCase())
})

test('resolves the canonical mainnet USDC address', () => {
  expect(getUsdcAddress().toLowerCase()).toBe(canonical.toLowerCase())
})

test('reads on-chain USDC metadata', async () => {
  const metadata = await getUsdcMetadata(client)
  expect(metadata.symbol).toBe('USDC')
  expect(metadata.decimals).toBe(6)
  expect(metadata.name).toBe('USD Coin')
}, 30_000)
