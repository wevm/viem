import { erc20Abi } from 'abitype/abis'
import { expect, test } from 'vitest'
import { prepareEncodeFunctionData } from './prepareEncodeFunctionData.js'

test('default', () => {
  const prepared = prepareEncodeFunctionData({
    abi: erc20Abi,
    functionName: 'transfer',
  })
  expect(prepared).toMatchInlineSnapshot(`
    {
      "abi": [
        {
          "inputs": [
            {
              "name": "recipient",
              "type": "address",
            },
            {
              "name": "amount",
              "type": "uint256",
            },
          ],
          "name": "transfer",
          "outputs": [
            {
              "name": "",
              "type": "bool",
            },
          ],
          "stateMutability": "nonpayable",
          "type": "function",
        },
      ],
      "functionName": "0xa9059cbb",
    }
  `)
})

test('inferred functionName', () => {
  expect(
    prepareEncodeFunctionData({
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
  ).toMatchInlineSnapshot(`
    {
      "abi": [
        {
          "inputs": [
            {
              "name": "a",
              "type": "uint256",
            },
          ],
          "name": "bar",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function",
        },
      ],
      "functionName": "0x0423a132",
    }
  `)
})

test("errors: function doesn't exist", () => {
  expect(() =>
    prepareEncodeFunctionData({
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

  expect(() =>
    prepareEncodeFunctionData({
      abi: erc20Abi,
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
    prepareEncodeFunctionData({
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
