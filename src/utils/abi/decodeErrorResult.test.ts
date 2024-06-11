import { expect, test } from 'vitest'

import { decodeErrorResult } from './decodeErrorResult.js'

test('revert SoldOutError()', () => {
  expect(
    decodeErrorResult({
      abi: [
        {
          inputs: [],
          name: 'SoldOutError',
          type: 'error',
        },
      ],
      data: '0x7f6df6bb',
    }),
  ).toEqual({
    abiItem: {
      inputs: [],
      name: 'SoldOutError',
      type: 'error',
    },
    errorName: 'SoldOutError',
    args: undefined,
  })
  expect(
    decodeErrorResult({
      abi: [
        {
          name: 'SoldOutError',
          type: 'error',
        },
      ],
      data: '0x7f6df6bb',
    }),
  ).toEqual({
    abiItem: {
      name: 'SoldOutError',
      type: 'error',
    },
    errorName: 'SoldOutError',
    args: undefined,
  })
})

test('revert AccessDeniedError(string)', () => {
  expect(
    decodeErrorResult({
      abi: [
        {
          inputs: [
            {
              name: 'a',
              type: 'string',
            },
          ],
          name: 'AccessDeniedError',
          type: 'error',
        },
      ],
      data: '0x83aa206e0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001a796f7520646f206e6f7420686176652061636365737320736572000000000000',
    }),
  ).toEqual({
    abiItem: {
      inputs: [
        {
          name: 'a',
          type: 'string',
        },
      ],
      name: 'AccessDeniedError',
      type: 'error',
    },
    errorName: 'AccessDeniedError',
    args: ['you do not have access ser'],
  })
})

test('revert AccessDeniedError((uint256,bool,address,uint256))', () => {
  expect(
    decodeErrorResult({
      abi: [
        {
          inputs: [
            {
              components: [
                {
                  name: 'weight',
                  type: 'uint256',
                },
                {
                  name: 'voted',
                  type: 'bool',
                },
                {
                  name: 'delegate',
                  type: 'address',
                },
                {
                  name: 'vote',
                  type: 'uint256',
                },
              ],

              name: 'voter',
              type: 'tuple',
            },
          ],
          name: 'AccessDeniedError',
          type: 'error',
        },
      ],
      data: '0x0a1895610000000000000000000000000000000000000000000000000000000000010f2c0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac0000000000000000000000000000000000000000000000000000000000000029',
    }),
  ).toEqual({
    abiItem: {
      inputs: [
        {
          components: [
            {
              name: 'weight',
              type: 'uint256',
            },
            {
              name: 'voted',
              type: 'bool',
            },
            {
              name: 'delegate',
              type: 'address',
            },
            {
              name: 'vote',
              type: 'uint256',
            },
          ],

          name: 'voter',
          type: 'tuple',
        },
      ],
      name: 'AccessDeniedError',
      type: 'error',
    },
    errorName: 'AccessDeniedError',
    args: [
      {
        delegate: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        vote: 41n,
        voted: true,
        weight: 69420n,
      },
    ],
  })
})

test('Error(string)', () => {
  expect(
    decodeErrorResult({
      data: '0x08c379a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000047465737400000000000000000000000000000000000000000000000000000000',
    }),
  ).toEqual({
    abiItem: {
      inputs: [
        {
          name: 'message',
          type: 'string',
        },
      ],
      name: 'Error',
      type: 'error',
    },
    errorName: 'Error',
    args: ['test'],
  })
})

test.todo('Panic(uint256)')

test('zero data', () => {
  expect(() =>
    decodeErrorResult({
      abi: [
        {
          inputs: [],
          name: 'SoldOutError',
          type: 'error',
        },
      ],
      data: '0x',
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [AbiDecodingZeroDataError: Cannot decode zero data ("0x") with ABI parameters.

    Version: viem@x.y.z]
  `)
})

test("errors: error doesn't exist", () => {
  expect(() =>
    decodeErrorResult({
      abi: [
        {
          inputs: [],
          name: 'SoldOutError',
          type: 'error',
        },
      ],
      data: '0xa37414670000000000000000000000000000000000000000000000000000000000010f2c0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac0000000000000000000000000000000000000000000000000000000000000029',
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [AbiErrorSignatureNotFoundError: Encoded error signature "0xa3741467" not found on ABI.
    Make sure you are using the correct ABI and that the error exists on it.
    You can look up the decoded signature here: https://openchain.xyz/signatures?query=0xa3741467.

    Docs: https://viem.sh/docs/contract/decodeErrorResult
    Version: viem@x.y.z]
  `)
})
