import { parseAbi } from 'abitype'
import { describe, expect, test } from 'vitest'
import { multicall3Abi } from '../../constants/abis.js'
import { decodeFunctionResult } from '../index.js'
import { encodeFunctionResult } from './encodeFunctionResult.js'

test('returns ()', () => {
  expect(
    encodeFunctionResult({
      abi: [
        {
          inputs: [],
          name: 'foo',
          outputs: [],
          stateMutability: 'pure',
          type: 'function',
        },
      ],
      functionName: 'foo',
      result: undefined,
    }),
  ).toEqual('0x')
  expect(
    encodeFunctionResult({
      abi: [
        {
          inputs: [],
          name: 'foo',
          outputs: [],
          stateMutability: 'pure',
          type: 'function',
        },
      ],
      functionName: 'foo',
      result: undefined,
    }),
  ).toEqual('0x')
  expect(
    encodeFunctionResult({
      abi: [
        {
          inputs: [],
          name: 'foo',
          outputs: [],
          stateMutability: 'pure',
          type: 'function',
        },
      ],
      functionName: 'foo',
    }),
  ).toEqual('0x')
})

test('returns (address)', () => {
  expect(
    encodeFunctionResult({
      abi: [
        {
          inputs: [],
          name: 'foo',
          outputs: [
            {
              name: 'sender',
              type: 'address',
            },
          ],
          stateMutability: 'pure',
          type: 'function',
        },
      ],
      functionName: 'foo',
      result: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
    }),
  ).toEqual(
    '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac',
  )
})

test('returns (Bar)', () => {
  expect(
    encodeFunctionResult({
      abi: [
        {
          inputs: [],
          name: 'bar',
          outputs: [
            {
              components: [
                {
                  components: [
                    {
                      name: 'sender',
                      type: 'address',
                    },
                    {
                      name: 'x',
                      type: 'uint256',
                    },
                    {
                      name: 'y',
                      type: 'bool',
                    },
                  ],
                  name: 'foo',
                  type: 'tuple',
                },
                {
                  name: 'sender',
                  type: 'address',
                },
                {
                  name: 'z',
                  type: 'uint32',
                },
              ],
              name: 'res',
              type: 'tuple',
            },
          ],
          stateMutability: 'pure',
          type: 'function',
        },
      ],
      functionName: 'bar',
      result: {
        foo: {
          sender: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
          x: 69420n,
          y: true,
        },
        sender: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        z: 69,
      },
    }),
  ).toEqual(
    '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac0000000000000000000000000000000000000000000000000000000000010f2c0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac0000000000000000000000000000000000000000000000000000000000000045',
  )
})

test('returns (Bar, string)', () => {
  expect(
    encodeFunctionResult({
      abi: [
        {
          inputs: [],
          name: 'baz',
          outputs: [
            {
              components: [
                {
                  components: [
                    {
                      name: 'sender',
                      type: 'address',
                    },
                    {
                      name: 'x',
                      type: 'uint256',
                    },
                    {
                      name: 'y',
                      type: 'bool',
                    },
                  ],
                  name: 'foo',
                  type: 'tuple',
                },
                {
                  name: 'sender',
                  type: 'address',
                },
                {
                  name: 'z',
                  type: 'uint32',
                },
              ],
              name: 'res',
              type: 'tuple',
            },
            {
              name: 'bob',
              type: 'string',
            },
          ],
          stateMutability: 'pure',
          type: 'function',
        },
      ],
      functionName: 'baz',
      result: [
        {
          foo: {
            sender: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
            x: 69420n,
            y: true,
          },
          sender: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
          z: 69,
        },
        'wagmi',
      ],
    }),
  ).toEqual(
    '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac0000000000000000000000000000000000000000000000000000000000010f2c0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac000000000000000000000000000000000000000000000000000000000000004500000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000057761676d69000000000000000000000000000000000000000000000000000000',
  )
})

test('inferred functionName', () => {
  expect(
    encodeFunctionResult({
      abi: [
        {
          inputs: [],
          name: 'foo',
          outputs: [
            {
              name: 'sender',
              type: 'address',
            },
          ],
          stateMutability: 'pure',
          type: 'function',
        },
      ],
      result: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
    }),
  ).toEqual(
    '0x000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac',
  )
})

test("error: function doesn't exist", () => {
  expect(() =>
    encodeFunctionResult({
      abi: [
        {
          inputs: [],
          name: 'foo',
          outputs: [
            {
              name: 'sender',
              type: 'address',
            },
          ],
          stateMutability: 'pure',
          type: 'function',
        },
      ],
      // @ts-expect-error
      functionName: 'baz',
      result: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
    }),
  ).toThrowErrorMatchingInlineSnapshot(
    `
    [AbiFunctionNotFoundError: Function "baz" not found on ABI.
    Make sure you are using the correct ABI and that the function exists on it.

    See: https://viem.sh/docs/contract/encodeFunctionResult
    Version: viem@x.y.z]
  `,
  )
})

test("error: function doesn't exist", () => {
  expect(() =>
    encodeFunctionResult({
      abi: [
        {
          inputs: [],
          name: 'foo',
          stateMutability: 'pure',
          type: 'function',
        },
      ],
      functionName: 'foo',
      result: ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'],
    }),
  ).toThrowErrorMatchingInlineSnapshot(
    `
    [AbiFunctionOutputsNotFoundError: Function "foo" does not contain any \`outputs\` on ABI.
    Cannot decode function result without knowing what the parameter types are.
    Make sure you are using the correct ABI and that the function exists on it.

    See: https://viem.sh/docs/contract/encodeFunctionResult
    Version: viem@x.y.z]
  `,
  )
})

test('errors: abi item not a function', () => {
  expect(() =>
    // @ts-expect-error
    encodeFunctionResult({
      abi: [
        {
          inputs: [],
          name: 'Foo',
          outputs: [],
          type: 'error',
        },
      ],
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [AbiFunctionNotFoundError: Function not found on ABI.
    Make sure you are using the correct ABI and that the function exists on it.

    See: https://viem.sh/docs/contract/encodeFunctionResult
    Version: viem@x.y.z]
  `)
})

test('errors: invalid array', () => {
  expect(() =>
    encodeFunctionResult({
      abi: parseAbi(['function x() returns (uint256, uint256)']),
      // @ts-expect-error
      result: 1n,
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [InvalidArrayError: Value "1" is not a valid array.

    Version: viem@x.y.z]
  `)
})
describe('https://github.com/wevm/viem/issues/3415', () => {
  test.each([
    {
      abi: multicall3Abi,
      functionName: 'aggregate3',
      result: [
        {
          success: true,
          returnData:
            '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
        },
      ],
    },
    {
      abi: parseAbi(['function x() returns (uint256[])']),
      result: [1n, 2n, 3n],
    },
    {
      abi: parseAbi(['function x() returns (uint256[][])']),
      result: [[1n, 2n, 3n]],
    },
    {
      abi: parseAbi(['function x() returns (uint256[][], uint256[][])']),
      result: [[[1n, 2n, 3n]], [[7n, 8n, 9n]]],
    },
    {
      abi: parseAbi(['function x() returns (uint256[], uint256[])']),
      result: [
        [1n, 2n, 3n],
        [4n, 5n, 6n],
      ],
    },
  ])('', ({ abi, functionName, result }: any) => {
    expect(
      decodeFunctionResult({
        abi,
        data: encodeFunctionResult({
          abi,
          functionName,
          result,
        }),
      }),
    ).toEqual(result)
  })
})
