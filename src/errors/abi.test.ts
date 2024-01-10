import { describe, expect, test } from 'vitest'

import {
  AbiDecodingDataSizeInvalidError,
  AbiDecodingDataSizeTooSmallError,
  AbiEncodingArrayLengthMismatchError,
  AbiEncodingLengthMismatchError,
  AbiEventSignatureEmptyTopicsError,
  DecodeLogDataMismatch,
  DecodeLogTopicsMismatch,
  InvalidAbiDecodingTypeError,
  InvalidAbiEncodingTypeError,
  InvalidArrayError,
} from './abi.js'

test('AbiDecodingDataSizeInvalidError', () => {
  expect(
    new AbiDecodingDataSizeInvalidError({ data: '0x1234', size: 2 }),
  ).toMatchInlineSnapshot(`
    [AbiDecodingDataSizeInvalidError: Data size of 2 bytes is invalid.
    Size must be in increments of 32 bytes (size % 32 === 0).

    Data: 0x1234 (2 bytes)

    Version: viem@1.0.2]
  `)
})

test('AbiDecodingDataSizeTooSmallError', () => {
  expect(
    new AbiDecodingDataSizeTooSmallError({
      data: '0x1234',
      params: [
        { name: 'a', type: 'uint256' },
        { name: 'b', type: 'uint256' },
      ],
      size: 2,
    }),
  ).toMatchInlineSnapshot(`
    [AbiDecodingDataSizeTooSmallError: Data size of 2 bytes is too small for given parameters.

    Params: (uint256 a, uint256 b)
    Data:   0x1234 (2 bytes)

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

test('AbiEventSignatureEmptyTopicsError', () => {
  expect(
    new AbiEventSignatureEmptyTopicsError({ docsPath: '/test' }),
  ).toMatchInlineSnapshot(`
    [AbiEventSignatureEmptyTopicsError: Cannot extract event signature from empty topics.

    Docs: https://viem.sh/test
    Version: viem@1.0.2]
  `)
})

test('DecodeLogDataMismatch', () => {
  expect(
    new DecodeLogDataMismatch({
      abiItem: {
        name: 'Event',
        inputs: [
          { name: 'a', type: 'uint256' },
          { name: 'b', type: 'uint256' },
        ],
        type: 'event',
      },
      data: '0x1234',
      params: [
        { name: 'a', type: 'uint256' },
        { name: 'b', type: 'uint256' },
      ],
      size: 2,
    }),
  ).toMatchInlineSnapshot(`
    [DecodeLogDataMismatch: Data size of 2 bytes is too small for non-indexed event parameters.

    Params: (uint256 a, uint256 b)
    Data:   0x1234 (2 bytes)

    Version: viem@1.0.2]
  `)
})

describe('DecodeLogTopicsMismatch', () => {
  test('default', () => {
    expect(
      new DecodeLogTopicsMismatch({
        abiItem: {
          inputs: [
            {
              indexed: true,
              name: 'from',
              type: 'address',
            },
            {
              indexed: true,
              name: 'to',
              type: 'address',
            },
            {
              indexed: true,
              name: 'id',
              type: 'uint256',
            },
          ],
          name: 'Transfer',
          type: 'event',
        },
        param: {
          indexed: true,
          name: 'id',
          type: 'uint256',
        },
      }),
    ).toMatchInlineSnapshot(`
      [DecodeLogTopicsMismatch: Expected a topic for indexed event parameter "id" on event "Transfer(address from, address to, uint256 id)".

      Version: viem@1.0.2]
    `)
  })

  test('unnamed', () => {
    expect(
      new DecodeLogTopicsMismatch({
        abiItem: {
          inputs: [
            {
              indexed: true,
              type: 'address',
            },
            {
              indexed: true,
              type: 'address',
            },
            {
              indexed: true,
              type: 'uint256',
            },
          ],
          name: 'Transfer',
          type: 'event',
        },
        param: {
          indexed: true,
          type: 'uint256',
        },
      }),
    ).toMatchInlineSnapshot(`
      [DecodeLogTopicsMismatch: Expected a topic for indexed event parameter on event "Transfer(address, address, uint256)".

      Version: viem@1.0.2]
    `)
  })
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
