import { readFileSync } from 'node:fs'
import { Client, webSocket } from 'viem'
import { mainnet } from 'viem/chains'
import { afterAll, expect, test } from 'vitest'
import { collectBlockNumbers } from '../src/index.ts'

const client = Client.create({
  chain: mainnet,
  transport: webSocket('ws://anvil:8545'),
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

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

afterAll(async () => {
  const rpcClient = await client.transport.getRpcClient()
  rpcClient.close()
})

test('uses viem', () => {
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
})

test('collects the first 3 block numbers, then stops', async () => {
  const promise = collectBlockNumbers(client, { count: 3 })
  // Let the subscription establish before producing blocks.
  await wait(1_000)

  for (let i = 0; i < 3; i++) {
    await rpc('anvil_mine', ['0x1'])
    await wait(400)
  }

  const numbers = await promise
  expect(numbers).toHaveLength(3)
  for (const value of numbers) expect(typeof value).toBe('bigint')
  for (let i = 1; i < numbers.length; i++)
    expect(numbers[i]! > numbers[i - 1]!).toBe(true)

  // Watcher must be stopped: further blocks must not grow the result.
  await rpc('anvil_mine', ['0x2'])
  await wait(1_000)
  expect(numbers).toHaveLength(3)
}, 60_000)
