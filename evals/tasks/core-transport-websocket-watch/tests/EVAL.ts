import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

type RpcResponse = {
  error?: { message: string }
}

async function rpc(method: string, params: unknown[]): Promise<void> {
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

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

test('uses viem', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/transport\s*:\s*webSocket\(/)
  expect(source).toMatch(/Actions\.block\.watchNumber\(/)
  expect(source).toMatch(/\.off\(\)/)
  expect(source).toMatch(/\.getRpcClient\(\)/)
  expect(source).toMatch(/\.close\(\)/)
}, 60_000)

test('exports a zero-input example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('collects the first 3 block numbers, then stops', async () => {
  const miner = (async () => {
    // Let the subscription establish before producing blocks.
    await wait(1_000)
    for (let i = 0; i < 3; i++) {
      await rpc('anvil_mine', ['0x1'])
      await wait(400)
    }
  })()

  const numbers = await example()
  await miner
  expect(numbers).toHaveLength(3)
  for (const value of numbers) expect(typeof value).toBe('bigint')
  for (let i = 1; i < numbers.length; i++)
    expect(numbers[i]! > numbers[i - 1]!).toBe(true)

  // Watcher must be stopped: further blocks must not grow the result.
  await rpc('anvil_mine', ['0x2'])
  await wait(1_000)
  expect(numbers).toHaveLength(3)
}, 60_000)
