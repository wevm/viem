import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { withTemporaryBalance } from '../src/index.ts'

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

// Dev account 1 (10000 ETH at boot, EIP-7702 code cleared).
const address = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('mutates the balance mid-flight and restores it exactly', async () => {
  const initial = BigInt(await rpc('eth_getBalance', [address, 'latest']))
  const value = initial + 123_456_789n

  const { before, during, after } = await withTemporaryBalance(client, {
    address,
    value,
  })

  expect(before).toBe(initial)
  expect(during).toBe(value)
  expect(during).not.toBe(before)
  expect(after).toBe(before)

  // The revert must land on-chain, not just in the returned object.
  expect(BigInt(await rpc('eth_getBalance', [address, 'latest']))).toBe(initial)
}, 60_000)
