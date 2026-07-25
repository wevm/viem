import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const token = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const holder = '0x28C6c06298d514Db089934071355E5743bf21d60'

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

async function balanceOf() {
  const data = `0x70a08231${holder.slice(2).toLowerCase().padStart(64, '0')}`
  return BigInt(await rpc('eth_call', [{ to: token, data }, 'latest']))
}

test('exports a zero-input viem example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/\bToken\.from\(/)
  expect(source).toMatch(/tokens\s*:/)
}, 60_000)

test('reads VUSD through the attached token definition', async () => {
  const result = await example()
  expect(result.amount).toBe(await balanceOf())
  expect(result.amount).toBe(31_872_448_355n)
  expect(result.decimals).toBe(6)
  expect(result.formatted).toBe('31872.448355')
}, 60_000)
