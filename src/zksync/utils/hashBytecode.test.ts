import { expect, test } from 'vitest'
import { hashBytecode } from './hashBytecode.js'

const validBytecode =
  '0x00050000000000020000008003000039000000400030043f0000000003010019'
const invalidBytecodeLengthMustBeDivisibleBy32 =
  '0x00050000000000020000008003000039000000400030043f0000000003010019d'
const invalidBytecodeLengthInWordsMustBeOdd =
  '0x00050000000000020000008003000039000000400030043f0000000003010019d50000000000020000008003000039000000400030043f0000000003010019d'

test('hashed bytecode', async () => {
  expect(hashBytecode(validBytecode)).toEqual(
    new Uint8Array([
      1, 0, 0, 1, 187, 37, 137, 118, 5, 213, 240, 79, 9, 123, 196, 48, 219, 199,
      57, 127, 89, 28, 230, 254, 35, 91, 75, 211, 88, 142, 190, 70,
    ]),
  )
})

test('errors: length must be divisible by 32', async () => {
  expect(() =>
    hashBytecode(invalidBytecodeLengthMustBeDivisibleBy32),
  ).toThrowErrorMatchingInlineSnapshot(
    `
    [BytecodeLengthMustBeDivisibleBy32Error: The bytecode length in bytes must be divisible by 32. Given length: 33

    Version: viem@x.y.z]
  `,
  )
})

test('errors: length in words must be odd', async () => {
  expect(() =>
    hashBytecode(invalidBytecodeLengthInWordsMustBeOdd),
  ).toThrowErrorMatchingInlineSnapshot(
    `
    [BytecodeLengthInWordsMustBeOddError: Bytecode length in 32-byte words must be odd. Given length in words: 2

    Version: viem@x.y.z]
  `,
  )
})
