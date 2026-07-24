import { readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { client, getPendingBalance } from '../src/index.ts'

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

const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
// History-free address at the pinned fork block (no balance, no code).
const recipient = '0x1111000000000000000000000000000000001111'

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
}, 60_000)

test('sees the pending balance while latest differs', async () => {
  // No code at the recipient (no EIP-7702 sweeper on the fork).
  expect(await rpc('eth_getCode', [recipient, 'latest'])).toBe('0x')

  const before = BigInt(await rpc('eth_getBalance', [recipient, 'latest']))
  const value = 12345678901234567n

  await rpc('anvil_setAutomine', [false])
  try {
    await rpc('eth_sendTransaction', [
      { from: sender, to: recipient, value: `0x${value.toString(16)}` },
    ])

    const pending = await getPendingBalance(client, { address: recipient })
    const latest = BigInt(await rpc('eth_getBalance', [recipient, 'latest']))

    expect(latest).toBe(before)
    expect(pending).toBe(before + value)
    expect(pending).not.toBe(latest)
  } finally {
    await rpc('anvil_setAutomine', [true])
    await rpc('anvil_mine', [1])
  }
}, 60_000)

test('reflects mined state once the transaction lands', async () => {
  const latest = BigInt(await rpc('eth_getBalance', [recipient, 'latest']))
  expect(await getPendingBalance(client, { address: recipient })).toBe(latest)
  expect(latest).toBe(12345678901234567n)
}, 60_000)
