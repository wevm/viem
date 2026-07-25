import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

test('uses viem', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(
    /fallback\(\[\s*http\(['"]http:\/\/anvil:1['"]\)\s*,\s*http\(['"]http:\/\/anvil:8545['"]\)\s*\]\)/,
  )
}, 60_000)

test('exports a zero-input example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('serves the request when the first endpoint is dead', async () => {
  const value = await example()
  expect(typeof value).toBe('bigint')
  expect(value).toBeGreaterThanOrEqual(24_000_000n)
  expect(value).toBeLessThan(24_001_000n)
}, 60_000)
