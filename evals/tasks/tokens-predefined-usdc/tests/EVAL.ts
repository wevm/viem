import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const canonical = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

test('exports a zero-input viem example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/from ['"]viem\/tokens['"]/)
  expect(source.toLowerCase()).not.toContain(canonical.toLowerCase())
}, 60_000)

test('resolves mainnet USDC and reads its metadata', async () => {
  const result = await example()
  expect(result.address.toLowerCase()).toBe(canonical.toLowerCase())
  expect(result.decimals).toBe(6)
  expect(result.name).toBe('USD Coin')
  expect(result.symbol).toBe('USDC')
  expect(result.totalSupply).toBeTypeOf('bigint')
  expect(result.totalSupply).toBeGreaterThan(0n)
}, 60_000)
