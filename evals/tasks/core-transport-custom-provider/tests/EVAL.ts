import { readFileSync } from 'node:fs'
import { Client } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { createTransport, getEthBalance } from '../src/index.ts'

async function rpc(method: string, params: unknown[] = []) {
  const res = await fetch('http://anvil:8545', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const { result, error } = (await res.json()) as any
  if (error) throw new Error(error.message)
  return result
}

// Hand-rolled EIP-1193 provider forwarding to the anvil node over fetch.
let id = 0
const provider = {
  async request({ method, params }: { method: string; params?: unknown }) {
    const res = await fetch('http://anvil:8545', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: ++id,
        method,
        params: params ?? [],
      }),
    })
    const { result, error } = (await res.json()) as any
    if (error) throw new Error(error.message)
    return result
  },
}

const client = Client.create({
  chain: mainnet,
  transport: createTransport({ provider }),
})
const failingProvider = {
  async request(): Promise<unknown> {
    throw new Error('provider offline')
  },
}
const failingClient = Client.create({
  chain: mainnet,
  transport: createTransport({ provider: failingProvider }),
})

const weth = '0xC02aaa39b223FE8D0A0e5C4F27eAD9083C756Cc2'

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('balance matches raw RPC', async () => {
  const value = await getEthBalance(client, { address: weth })
  expect(typeof value).toBe('bigint')
  expect(value).toBe(BigInt(await rpc('eth_getBalance', [weth, 'latest'])))
})

test('reads fresh state through the provider', async () => {
  const address = '0x5151515151515151515151515151515151515151'
  await rpc('anvil_setBalance', [address, '0xde0b6b3a7640000'])
  expect(await getEthBalance(client, { address })).toBe(
    1_000_000_000_000_000_000n,
  )
})

test('routes requests through the given provider', async () => {
  await expect(
    getEthBalance(failingClient, { address: weth }),
  ).rejects.toThrow()
}, 30_000)
