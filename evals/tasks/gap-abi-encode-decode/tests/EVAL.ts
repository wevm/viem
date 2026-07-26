import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

test('uses viem', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/Abis\.erc20/)
  expect(source).toMatch(/AbiFunction\.encodeData\(/)
  expect(source).toMatch(/AbiFunction\.decodeResult\(/)
}, 60_000)

test('exports a zero-input example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('encodes calldata and decodes a result', async () => {
  const result = await example()
  expect(result.calldata.toLowerCase()).toBe(
    '0xa9059cbb00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c800000000000000000000000000000000000000000000000000000000000f4240',
  )
  expect(result.balance).toBe(31_872_448_355n)
}, 60_000)
