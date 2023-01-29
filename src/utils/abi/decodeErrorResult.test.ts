import { expect, test } from 'vitest'

import { decodeErrorResult } from './decodeErrorResult'

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
  ).toEqual({ errorName: 'SoldOutError', args: undefined })
  expect(
    decodeErrorResult({
      abi: [
        // @ts-expect-error
        {
          name: 'SoldOutError',
          type: 'error',
        },
      ],
      data: '0x7f6df6bb',
    }),
  ).toEqual({ errorName: 'SoldOutError', args: undefined })
})

test('revert AccessDeniedError(string)', () => {
  expect(
    decodeErrorResult({
      abi: [
        {
          inputs: [
            {
              internalType: 'string',
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
                  internalType: 'uint256',
                  name: 'weight',
                  type: 'uint256',
                },
                {
                  internalType: 'bool',
                  name: 'voted',
                  type: 'bool',
                },
                {
                  internalType: 'address',
                  name: 'delegate',
                  type: 'address',
                },
                {
                  internalType: 'uint256',
                  name: 'vote',
                  type: 'uint256',
                },
              ],
              internalType: 'struct Ballot.Voter',
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
    "Encoded error signature \\"0xa3741467\\" not found on ABI.
    Make sure you are using the correct ABI and that the error exists on it.
    You can look up the signature \\"0xa3741467\\" here: https://sig.eth.samczsun.com/.

    Docs: https://viem.sh/docs/contract/decodeErrorResult

    Version: viem@1.0.2"
  `)
})
