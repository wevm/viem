import { readFileSync } from 'node:fs'
import { expect, expectTypeOf, test } from 'vitest'
import { example } from '../src/index.ts'

test('uses viem', () => {
  const source = readFileSync('src/index.ts', 'utf8')
  expect(source).toMatch(/from ['"]viem/)
  expect(source).toMatch(/Account\.fromMnemonic\(/)
}, 60_000)

test('exports a zero-input example', () => {
  expectTypeOf(example).parameters.toEqualTypeOf<[]>()
}, 60_000)

test('derives the fixed wallet examples', async () => {
  const result = await example()

  expect(result.indexed.map((address) => address.toLowerCase())).toEqual([
    '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
  ])
  expect(result.custom.toLowerCase()).toBe(
    '0x8c8d35429f74ec245f8ef2f4fd1e551cff97d650',
  )
  expect(result.passphrase.toLowerCase()).toBe(
    '0xd12896f31c1208de9cf8e7aad11c079fe97c43b0',
  )
  expect(result.passphrase.toLowerCase()).not.toBe(
    result.indexed[0]!.toLowerCase(),
  )
}, 60_000)
