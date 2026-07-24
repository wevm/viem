import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { simulateTransfers } from '../src/index.ts'

const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const recipients = [
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
] as const

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

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

test('simulates two ETH transfers without mutating state', async () => {
  const addresses = [sender, ...recipients]
  const before = await Promise.all(
    addresses.map((address) => rpc('eth_getBalance', [address, 'latest'])),
  )

  const results = await simulateTransfers(client, {
    from: sender,
    transfers: [
      { to: recipients[0], value: 1_000_000_000_000_000_000n },
      { to: recipients[1], value: 2_000_000_000_000_000_000n },
    ],
  })

  expect(results).toHaveLength(2)
  for (const result of results) {
    expect(result.status).toBe('success')
    expect(result.gasUsed).toBe(21000n)
  }

  const after = await Promise.all(
    addresses.map((address) => rpc('eth_getBalance', [address, 'latest'])),
  )
  expect(after).toEqual(before)
}, 60_000)
