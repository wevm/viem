import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

test('exports a zero-input viem example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
  expect(readFileSync('src/index.ts', 'utf8')).toMatch(/from ['"]viem/)
}, 60_000)

test('returns the EIP-712 signing domain as an object', async () => {
  const domain = await example()
  expect(domain.name).toBe('USDe')
  expect(domain.version).toBe('1')
  expect(domain.chainId).toBe(1n)
}, 60_000)
