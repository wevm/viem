import type { AbiParameter } from 'abitype'
import { describe, expect, test } from 'vitest'
import { wagmiContractConfig } from '../../_test/index.js'
import { toBytes } from '../encoding/index.js'
import { getAbiItem, isArgOfType } from './getAbiItem.js'

test('default', () => {
  expect(
    getAbiItem({
      abi: wagmiContractConfig.abi,
      name: 'balanceOf',
      args: ['0x0000000000000000000000000000000000000000'],
    }),
  ).toMatchInlineSnapshot(`
    {
      "inputs": [
        {
          "name": "owner",
          "type": "address",
        },
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "name": "",
          "type": "uint256",
        },
      ],
      "stateMutability": "view",
      "type": "function",
    }
  `)
})

test('no matching name', () => {
  expect(
    getAbiItem({
      abi: [],
      // @ts-expect-error
      name: 'balanceOf',
      args: ['0x0000000000000000000000000000000000000000'],
    }),
  ).toMatchInlineSnapshot('undefined')
})

test('overloads: no inputs', () => {
  expect(
    getAbiItem({
      abi: [
        {
          name: 'balanceOf',
          outputs: [{ name: 'x', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [{ name: 'x', type: 'uint256' }],
          name: 'balanceOf',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      name: 'balanceOf',
      args: ['0x0000000000000000000000000000000000000000'],
    }),
  ).toMatchInlineSnapshot(`
    {
      "name": "balanceOf",
      "outputs": [
        {
          "name": "x",
          "type": "uint256",
        },
      ],
      "stateMutability": "view",
      "type": "function",
    }
  `)
})

test('overloads: undefined inputs', () => {
  expect(
    getAbiItem({
      abi: [
        {
          inputs: undefined,
          name: 'balanceOf',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'balanceOf',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      name: 'balanceOf',
      args: ['0x0000000000000000000000000000000000000000'],
    }),
  ).toMatchInlineSnapshot(`
    {
      "inputs": undefined,
      "name": "balanceOf",
      "outputs": [
        {
          "name": "",
          "type": "uint256",
        },
      ],
      "stateMutability": "view",
      "type": "function",
    }
  `)
})

test('overloads: no args', () => {
  expect(
    getAbiItem({
      abi: [
        {
          inputs: [{ name: '', type: 'uint256' }],
          name: 'balanceOf',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
        {
          inputs: [],
          name: 'balanceOf',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      name: 'balanceOf',
    }),
  ).toMatchInlineSnapshot(`
    {
      "inputs": [],
      "name": "balanceOf",
      "outputs": [
        {
          "name": "",
          "type": "uint256",
        },
      ],
      "stateMutability": "view",
      "type": "function",
    }
  `)
})

test('overload: different lengths', () => {
  expect(
    getAbiItem({
      abi: wagmiContractConfig.abi,
      name: 'safeTransferFrom',
      args: [
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        420n,
      ],
    }),
  ).toMatchInlineSnapshot(`
    {
      "inputs": [
        {
          "name": "from",
          "type": "address",
        },
        {
          "name": "to",
          "type": "address",
        },
        {
          "name": "tokenId",
          "type": "uint256",
        },
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function",
    }
  `)

  expect(
    getAbiItem({
      abi: wagmiContractConfig.abi,
      name: 'safeTransferFrom',
      args: [
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        420n,
        '0x0000000000000000000000000000000000000000',
      ],
    }),
  ).toMatchInlineSnapshot(`
    {
      "inputs": [
        {
          "name": "from",
          "type": "address",
        },
        {
          "name": "to",
          "type": "address",
        },
        {
          "name": "tokenId",
          "type": "uint256",
        },
        {
          "name": "_data",
          "type": "bytes",
        },
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function",
    }
  `)
})

test('overload: different types', () => {
  const abi = [
    {
      inputs: [],
      name: 'mint',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ name: 'tokenId', type: 'uint256' }],
      name: 'mint',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ name: 'tokenId', type: 'string' }],
      name: 'mint',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ]

  expect(
    getAbiItem({
      abi,
      name: 'mint',
    }),
  ).toMatchInlineSnapshot(`
    {
      "inputs": [],
      "name": "mint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function",
    }
  `)

  expect(
    getAbiItem({
      abi,
      name: 'mint',
      args: [420n],
    }),
  ).toMatchInlineSnapshot(`
    {
      "inputs": [
        {
          "name": "tokenId",
          "type": "uint256",
        },
      ],
      "name": "mint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function",
    }
  `)

  expect(
    getAbiItem({
      abi,
      name: 'mint',
      args: ['foo'],
    }),
  ).toMatchInlineSnapshot(`
    {
      "inputs": [
        {
          "name": "tokenId",
          "type": "string",
        },
      ],
      "name": "mint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function",
    }
  `)
})

test('overloads: tuple', () => {
  expect(
    getAbiItem({
      abi: [
        {
          inputs: [
            { name: 'foo', type: 'uint256' },
            {
              name: 'bar',
              type: 'tuple',
              components: [
                { name: 'a', type: 'string' },
                {
                  name: 'b',
                  type: 'tuple',
                  components: [
                    { name: 'merp', type: 'string' },
                    { name: 'meep', type: 'string' },
                  ],
                },
                { name: 'c', type: 'uint256' },
              ],
            },
          ],
          name: 'foo',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        {
          inputs: [
            { name: 'foo', type: 'uint256' },
            {
              name: 'bar',
              type: 'tuple',
              components: [
                { name: 'a', type: 'string' },
                {
                  name: 'b',
                  type: 'tuple',
                  components: [
                    { name: 'merp', type: 'string' },
                    { name: 'meep', type: 'string' },
                  ],
                },
                { name: 'c', type: 'address' },
              ],
            },
          ],
          name: 'foo',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      name: 'foo',
      args: [
        420n,
        {
          a: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
          b: { merp: 'test', meep: 'test' },
          c: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
        },
      ],
    }),
  ).toMatchInlineSnapshot(`
    {
      "inputs": [
        {
          "name": "foo",
          "type": "uint256",
        },
        {
          "components": [
            {
              "name": "a",
              "type": "string",
            },
            {
              "components": [
                {
                  "name": "merp",
                  "type": "string",
                },
                {
                  "name": "meep",
                  "type": "string",
                },
              ],
              "name": "b",
              "type": "tuple",
            },
            {
              "name": "c",
              "type": "address",
            },
          ],
          "name": "bar",
          "type": "tuple",
        },
      ],
      "name": "foo",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function",
    }
  `)
})

describe.each([
  // array
  { arg: ['foo'], abiParameter: { type: 'string[]' }, expected: true },
  { arg: ['foo'], abiParameter: { type: 'string[1]' }, expected: true },
  { arg: [['foo']], abiParameter: { type: 'string[][]' }, expected: true },
  { arg: [['foo']], abiParameter: { type: 'string[][1]' }, expected: true },
  {
    arg: [1n],
    abiParameter: { type: 'uint256[]' },
    expected: true,
  },
  {
    arg: [{ foo: 1n, bar: [{ baz: 1n }] }],
    abiParameter: {
      type: 'tuple[]',
      components: [
        { name: 'foo', type: 'uint256' },
        {
          name: 'bar',
          type: 'tuple[]',
          components: [{ name: 'baz', type: 'uint256' }],
        },
      ],
    },
    expected: true,
  },
  { arg: ['foo'], abiParameter: { type: 'string[test]' }, expected: false },
  { arg: [1], abiParameter: { type: 'uint69[]' }, expected: false },
  // address
  {
    arg: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
    abiParameter: { type: 'address' },
    expected: true,
  },
  {
    arg: 'A0Cf798816D4b9b9866b5330EEa46a18382f251e',
    abiParameter: { type: 'address' },
    expected: false,
  },
  { arg: 'test', abiParameter: { type: 'address' }, expected: false },
  // bool
  { arg: true, abiParameter: { type: 'bool' }, expected: true },
  { arg: false, abiParameter: { type: 'bool' }, expected: true },
  { arg: 'true', abiParameter: { type: 'bool' }, expected: false },
  // bytes
  { arg: 'foo', abiParameter: { type: 'bytes' }, expected: true },
  { arg: 'foo', abiParameter: { type: 'bytes32' }, expected: true },
  { arg: toBytes('foo'), abiParameter: { type: 'bytes' }, expected: true },
  { arg: 1, abiParameter: { type: 'bytes32' }, expected: false },
  // function
  { arg: 'foo', abiParameter: { type: 'function' }, expected: true },
  { arg: 1, abiParameter: { type: 'function' }, expected: false },
  // int
  { arg: 1, abiParameter: { type: 'int' }, expected: true },
  { arg: 1n, abiParameter: { type: 'int' }, expected: true },
  { arg: 1n, abiParameter: { type: 'int' }, expected: true },
  { arg: 1, abiParameter: { type: 'uint' }, expected: true },
  { arg: 1n, abiParameter: { type: 'uint' }, expected: true },
  { arg: 1n, abiParameter: { type: 'uint' }, expected: true },
  { arg: 1, abiParameter: { type: 'int256' }, expected: true },
  { arg: 1, abiParameter: { type: 'uint256' }, expected: true },
  { arg: 1, abiParameter: { type: 'int69' }, expected: false },
  { arg: 1, abiParameter: { type: 'uint69' }, expected: false },
  // string
  { arg: 'foo', abiParameter: { type: 'string' }, expected: true },
  { arg: 1, abiParameter: { type: 'string' }, expected: false },
  // tuple
  {
    arg: { bar: 1, baz: 'test' },
    abiParameter: {
      name: 'foo',
      type: 'tuple',
      components: [
        { name: 'bar', type: 'uint256' },
        { name: 'baz', type: 'string' },
      ],
    },
    expected: true,
  },
  {
    arg: [1, 'test'],
    abiParameter: {
      name: 'foo',
      type: 'tuple',
      components: [
        { name: 'bar', type: 'uint256' },
        { name: 'baz', type: 'string' },
      ],
    },
    expected: true,
  },
  {
    arg: { bar: ['test'] },
    abiParameter: {
      name: 'foo',
      type: 'tuple',
      components: [
        {
          name: 'bar',
          type: 'tuple',
          components: [{ name: 'baz', type: 'string' }],
        },
      ],
    },
    expected: true,
  },
  {
    arg: {},
    abiParameter: {
      name: 'foo',
      type: 'tuple',
      components: [
        { name: 'bar', type: 'uint256' },
        { name: 'baz', type: 'uint256' },
      ],
    },
    expected: false,
  },
] as { arg: unknown; abiParameter: AbiParameter; expected: boolean }[])(
  'isArgOfType($arg, $abiParameter)',
  ({ arg, abiParameter, expected }) => {
    test(`isArgOfType: returns ${expected}`, () => {
      expect(isArgOfType(arg, abiParameter)).toEqual(expected)
    })
  },
)
