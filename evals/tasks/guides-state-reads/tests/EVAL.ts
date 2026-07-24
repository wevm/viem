import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { beforeAll, expect, test } from 'vitest'
import { getAccountState } from '../src/index.ts'

const address = '0x53e205a3d2286c93630f4e1de81b95dbbf2ec241'
const balance = 1234567890123456789n
const nonce = 7
const code =
  '0x363d3d373d3d3d363d73bebebebebebebebebebebebebebebebebebebebe5af43d82803e903d91602b57fd5bf3'
const slot0 =
  '0x000000000000000000000000000000000000000000000000000000000000002a'

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

beforeAll(async () => {
  await rpc('anvil_setBalance', [address, `0x${balance.toString(16)}`])
  await rpc('anvil_setNonce', [address, `0x${nonce.toString(16)}`])
  await rpc('anvil_setCode', [address, code])
  await rpc('anvil_setStorageAt', [address, '0x0', slot0])
}, 30_000)

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('reads balance, nonce, code, and storage slot 0', async () => {
  const state = await getAccountState(client, { address })
  expect(state.balance).toBe(balance)
  expect(state.nonce).toBe(nonce)
  expect(state.code?.toLowerCase()).toBe(code)
  expect(state.storageSlot0?.toLowerCase()).toBe(slot0)
}, 30_000)
