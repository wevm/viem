import { expect, test } from 'vitest'

import { erc20Abi } from 'abitype/abis'
import { encodeFunctionData } from './encodeFunctionData.js'
import { prepareEncodeFunctionData } from './prepareEncodeFunctionData.js'

test('foo()', () => {
  expect(
    encodeFunctionData({
      abi: [
        {
          inputs: [],
          name: 'foo',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      functionName: 'foo',
    }),
  ).toEqual('0xc2985578')
  expect(
    encodeFunctionData({
      abi: [
        {
          name: 'foo',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      functionName: 'foo',
    }),
  ).toEqual('0xc2985578')
})

test('bar(uint256)', () => {
  expect(
    encodeFunctionData({
      abi: [
        {
          inputs: [
            {
              name: 'a',
              type: 'uint256',
            },
          ],
          name: 'bar',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      functionName: 'bar',
      args: [1n],
    }),
  ).toEqual(
    '0x0423a1320000000000000000000000000000000000000000000000000000000000000001',
  )
})

test('getVoter((uint256,bool,address,uint256))', () => {
  expect(
    encodeFunctionData({
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
          name: 'getVoter',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      functionName: 'getVoter',
      args: [
        {
          delegate: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
          vote: 41n,
          voted: true,
          weight: 69420n,
        },
      ],
    }),
  ).toEqual(
    '0xf37414670000000000000000000000000000000000000000000000000000000000010f2c0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a5cc3c03994db5b0d9a5eedd10cabab0813678ac0000000000000000000000000000000000000000000000000000000000000029',
  )
})

test('inferred functionName', () => {
  expect(
    encodeFunctionData({
      abi: [
        {
          inputs: [
            {
              name: 'a',
              type: 'uint256',
            },
          ],
          name: 'bar',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      args: [1n],
    }),
  ).toEqual(
    '0x0423a1320000000000000000000000000000000000000000000000000000000000000001',
  )
})

test('selector as functionName', () => {
  const data = encodeFunctionData({
    abi: erc20Abi,
    functionName: '0xa9059cbb',
    args: ['0x0000000000000000000000000000000000000000', 69420n],
  })
  expect(data).toMatchInlineSnapshot(
    `"0xa9059cbb00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010f2c"`,
  )
})

test('prepared', () => {
  const transfer = prepareEncodeFunctionData({
    abi: erc20Abi,
    functionName: 'transfer',
  })
  const data_prepared = encodeFunctionData({
    ...transfer,
    args: ['0x0000000000000000000000000000000000000000', 69420n],
  })
  const data = encodeFunctionData({
    abi: erc20Abi,
    functionName: 'transfer',
    args: ['0x0000000000000000000000000000000000000000', 69420n],
  })
  expect(data_prepared).toEqual(data)
})

test("errors: function doesn't exist", () => {
  expect(() =>
    encodeFunctionData({
      abi: [
        {
          inputs: [],
          name: 'foo',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      // @ts-expect-error
      functionName: 'bar',
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [AbiFunctionNotFoundError: Function "bar" not found on ABI.
    Make sure you are using the correct ABI and that the function exists on it.

    Docs: https://viem.sh/docs/contract/encodeFunctionData
    Version: viem@x.y.z]
  `)
})

test('errors: abi item not a function', () => {
  expect(() =>
    // @ts-expect-error abi has no functions
    encodeFunctionData({
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

    Docs: https://viem.sh/docs/contract/encodeFunctionData
    Version: viem@x.y.z]
  `)
})
