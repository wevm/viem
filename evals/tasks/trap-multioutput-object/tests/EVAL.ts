import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { getSigningDomain } from '../src/index.ts'

// Ethena USDe: implements ERC-5267 at the pinned fork block.
const usde = '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('returns the EIP-712 signing domain as an object', async () => {
  const domain = await getSigningDomain(client, { token: usde })
  expect(domain.name).toBe('USDe')
  expect(domain.version).toBe('1')
  expect(domain.chainId).toBe(1n)
}, 60_000)
