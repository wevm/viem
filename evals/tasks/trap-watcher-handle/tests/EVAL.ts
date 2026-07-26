import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

test('exports a zero-input viem example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/\bfor\s+await\s*\(/)
  expect(source).toMatch(/\.off\s*\(\s*\)/)
}, 60_000)

test('collects three blocks, then goes quiet', async () => {
  const baseline = BigInt(await rpc('eth_blockNumber', []))
  const mining = (async () => {
    await sleep(100)
    for (let i = 0; i < 8; i++) {
      await rpc('anvil_mine', ['0x1'])
      await sleep(500)
    }
  })()
  const numbers = await example()
  await mining
  await sleep(500)

  expect(numbers).toHaveLength(3)
  expect(numbers[0]!).toBeGreaterThanOrEqual(baseline)
  for (let i = 1; i < numbers.length; i++)
    expect(numbers[i]! > numbers[i - 1]!).toBe(true)
  expect(numbers).toHaveLength(3)
}, 120_000)
