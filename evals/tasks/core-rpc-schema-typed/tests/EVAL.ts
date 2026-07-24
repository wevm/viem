import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { expect, test } from 'vitest'
import { schema, setBalance } from '../src/index.ts'

// History-free address at the pinned fork block.
const address = '0x4242424242424242424242424242424242424242'
const client = Client.create({
  schema,
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

test('sets the balance and returns it', async () => {
  const wei = 123_456_789_012_345_678_901n
  expect(await setBalance(client, { address, wei })).toBe(wei)
  expect(BigInt(await rpc('eth_getBalance', [address, 'latest']))).toBe(wei)
})

test('overwrites a previously set balance', async () => {
  const wei = 42n
  expect(await setBalance(client, { address, wei })).toBe(wei)
  expect(BigInt(await rpc('eth_getBalance', [address, 'latest']))).toBe(wei)
})
