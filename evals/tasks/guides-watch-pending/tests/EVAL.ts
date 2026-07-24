import { readFileSync } from 'node:fs'
import { Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, test } from 'vitest'
import { getFirstPendingHash } from '../src/index.ts'

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

const sender = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const recipient = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'

const client = Client.create({
  chain: mainnet,
  pollingInterval: 200,
  transport: http('http://anvil:8545'),
})

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('resolves with the hash of the first pending transaction', async () => {
  await rpc('anvil_setAutomine', [false])
  try {
    const pending = getFirstPendingHash(client)
    // Give the watcher time to attach to the pool before broadcasting.
    await new Promise((resolve) => setTimeout(resolve, 2_000))
    const hash = await rpc('eth_sendTransaction', [
      { from: sender, to: recipient, value: '0x1' },
    ])
    expect(await pending).toBe(hash)
  } finally {
    await rpc('anvil_setAutomine', [true])
    await rpc('anvil_mine', ['0x1'])
  }
}, 60_000)
