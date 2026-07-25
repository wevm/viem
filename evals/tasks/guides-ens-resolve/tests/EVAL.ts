import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

const sourceText = readFileSync('src/index.ts', 'utf8')
const vitalik = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

test('exports a zero-input Viem example', () => {
  expect(sourceText).toMatch(/from ['"]viem/)
  expect(sourceText).toMatch(/^const \w*client\s*=\s*Client\.create\s*\(/im)
  expect(sourceText).toMatch(/\bEns\.normalize\s*\(/)
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('resolves the ENS forward and reverse records', async () => {
  const result = await example()
  expect(result.address?.toLowerCase()).toBe(vitalik.toLowerCase())
  expect(result.name).toBe('vitalik.eth')
}, 60_000)
