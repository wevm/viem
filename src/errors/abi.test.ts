import { expect, test } from 'vitest'
import {
  AbiDecodingDataSizeInvalidError,
  AbiEncodingArrayLengthMismatchError,
  AbiEncodingLengthMismatchError,
  InvalidAbiDecodingTypeError,
  InvalidAbiEncodingTypeError,
  InvalidArrayError,
} from './abi'

test('AbiDecodingDataSizeInvalidError', () => {
  expect(new AbiDecodingDataSizeInvalidError(69)).toMatchInlineSnapshot(`
    [AbiDecodingDataSizeInvalidError: Data size of 69 bytes is invalid.
    Size must be in increments of 32 bytes (size % 32 === 0).

    Version: viem@1.0.2]
  `)
})

test('InvalidAbiDecodingTypeError', () => {
  expect(
    new InvalidAbiDecodingTypeError('lol', { docsPath: '/lol' }),
  ).toMatchInlineSnapshot(`
    [InvalidAbiDecodingType: Type "lol" is not a valid decoding type.
    Please provide a valid ABI type.

    Docs: https://viem.sh/lol

    Version: viem@1.0.2]
  `)
})

test('AbiEncodingArrayLengthMismatchError', () => {
  expect(
    new AbiEncodingArrayLengthMismatchError({
      expectedLength: 69,
      givenLength: 420,
      type: 'uint256[3]',
    }),
  ).toMatchInlineSnapshot(`
    [AbiEncodingArrayLengthMismatchError: ABI encoding array length mismatch for type uint256[3].
    Expected length: 69
    Given length: 420

    Version: viem@1.0.2]
  `)
})

test('AbiEncodingLengthMismatchError', () => {
  expect(
    new AbiEncodingLengthMismatchError({
      expectedLength: 69,
      givenLength: 420,
    }),
  ).toMatchInlineSnapshot(`
    [AbiEncodingLengthMismatchError: ABI encoding params/values length mismatch.
    Expected length (params): 69
    Given length (values): 420

    Version: viem@1.0.2]
  `)
})

test('InvalidAbiEncodingTypeError', () => {
  expect(
    new InvalidAbiEncodingTypeError('lol', { docsPath: '/lol' }),
  ).toMatchInlineSnapshot(`
    [InvalidAbiEncodingType: Type "lol" is not a valid encoding type.
    Please provide a valid ABI type.

    Docs: https://viem.sh/lol

    Version: viem@1.0.2]
  `)
})

test('InvalidArrayError', () => {
  expect(new InvalidArrayError('lol')).toMatchInlineSnapshot(`
    [InvalidArrayError: Value "lol" is not a valid array.

    Version: viem@1.0.2]
  `)
})
