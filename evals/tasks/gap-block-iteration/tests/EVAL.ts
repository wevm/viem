import { readFileSync } from 'node:fs'
import { Actions, Client, http } from 'viem'
import { mainnet } from 'viem/chains'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

type RpcResponse = {
  error?: { message: string }
}

async function rpc(method: string, params: unknown[]): Promise<void> {
  // Retry transient network failures (socket closed under parallel load).
  let response: RpcResponse | undefined
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch('http://anvil:8545', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      response = await res.json()
      break
    } catch (error) {
      if (attempt === 2) throw error
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }
  if (!response) throw new Error('RPC did not return a response')
  if (response.error) throw new Error(response.error.message)
}

const client = Client.create({
  chain: mainnet,
  transport: http('http://anvil:8545'),
})

test('uses a block watcher and disposes it', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/Actions\.block\.watch/)
  expect(source).toMatch(/\.off\s*\(/)
  expect(source).toMatch(/for\s+await/)
}, 60_000)

test('exports a zero-input example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('collects the next 3 block numbers and terminates', async () => {
  const start = await Actions.block.getNumber(client)
  // Advance the chain before the collector starts: every block it can
  // observe is strictly greater than `start`.
  await rpc('anvil_mine', ['0x1'])

  // Mine a block every 250ms in the background while the collector runs.
  let mining = true
  const miner = (async () => {
    while (mining) {
      await new Promise((resolve) => setTimeout(resolve, 250))
      await rpc('anvil_mine', ['0x1'])
    }
  })()

  try {
    const numbers = await example()

    expect(numbers).toHaveLength(3)
    for (const number of numbers) {
      expect(typeof number).toBe('bigint')
      expect(number).toBeGreaterThan(start)
    }
    expect(numbers[1]!).toBeGreaterThan(numbers[0]!)
    expect(numbers[2]!).toBeGreaterThan(numbers[1]!)
  } finally {
    mining = false
    await miner
  }
}, 120_000)
