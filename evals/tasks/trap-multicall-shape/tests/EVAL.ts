import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
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

async function call(data: string) {
  return rpc('eth_call', [{ to: usdc, data }, 'latest'])
}

test('exports a zero-input viem example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source.match(/\bActions\.multicall\s*\(/g)).toHaveLength(2)
  expect(source.match(/\ballowFailure\s*:\s*false/g)).toHaveLength(2)
  expect(source).toMatch(/\bContractFunctionZeroDataError\b/)
}, 60_000)

test('returns ordered values and rejects a failed batch', async () => {
  const result = await example()
  const expected = [
    BigInt(
      await call(
        `0x70a08231${holder.slice(2).toLowerCase().padStart(64, '0')}`,
      ),
    ),
    BigInt(await call('0x18160ddd')),
    Number(BigInt(await call('0x313ce567'))),
  ]
  expect(result.values).toEqual(expected)
  expect(result.rejected).toBe(true)
}, 60_000)
