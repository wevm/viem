import { type AbiParameter, parseAbi, parseAbiParameters } from 'abitype'

import { describe, expect, test } from 'vitest'

import { wagmiContractConfig } from '~test/abis.js'

import { toBytes } from '../index.js'
import { getAbiItem, getAmbiguousTypes, isArgOfType } from './getAbiItem.js'

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

describe('selector', () => {
  test('function', () => {
    expect(
      getAbiItem({
        abi: wagmiContractConfig.abi,
        name: '0x70a08231',
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

  test('event', () => {
    expect(
      getAbiItem({
        abi: wagmiContractConfig.abi,
        name: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      }),
    ).toMatchInlineSnapshot(`
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "from",
            "type": "address",
          },
          {
            "indexed": true,
            "name": "to",
            "type": "address",
          },
          {
            "indexed": true,
            "name": "tokenId",
            "type": "uint256",
          },
        ],
        "name": "Transfer",
        "type": "event",
      }
    `)
  })
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

test('overload: different lengths without abi order define effect', () => {
  const abis = wagmiContractConfig.abi.filter(
    (abi) => abi.type === 'function' && abi.name === 'safeTransferFrom',
  )
  const shortArgs = [
    '0x0000000000000000000000000000000000000000',
    '0x0000000000000000000000000000000000000000',
    420n,
  ] as const
  const shortSnapshot = `
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
  `
  const longArgs = [
    '0x0000000000000000000000000000000000000000',
    '0x0000000000000000000000000000000000000000',
    420n,
    '0x0000000000000000000000000000000000000000',
  ] as const
  const longSnapshot = `
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
  `
  expect(
    getAbiItem({
      abi: abis,
      name: 'safeTransferFrom',
      args: shortArgs,
    }),
  ).toMatchInlineSnapshot(shortSnapshot)
  expect(
    getAbiItem({
      abi: abis.reverse(),
      name: 'safeTransferFrom',
      args: shortArgs,
    }),
  ).toMatchInlineSnapshot(shortSnapshot)

  expect(
    getAbiItem({
      abi: abis,
      name: 'safeTransferFrom',
      args: longArgs,
    }),
  ).toMatchInlineSnapshot(longSnapshot)
  expect(
    getAbiItem({
      abi: abis.reverse(),
      name: 'safeTransferFrom',
      args: longArgs,
    }),
  ).toMatchInlineSnapshot(longSnapshot)
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

test('overloads: array of sized type with a zero digit', () => {
  const abi = parseAbi(['function foo(bool x)', 'function foo(uint160[] x)'])

  expect(
    getAbiItem({
      abi,
      name: 'foo',
      args: [[1n, 2n]],
    }),
  ).toMatchInlineSnapshot(`
    {
      "inputs": [
        {
          "name": "x",
          "type": "uint160[]",
        },
      ],
      "name": "foo",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function",
    }
  `)
})

test('overloads: fixed-length arrays', () => {
  const abi = parseAbi([
    'function foo(uint256[3] x)',
    'function foo(uint256[2] x)',
  ])

  expect(
    getAbiItem({
      abi,
      name: 'foo',
      args: [[1n, 2n, 3n]],
    }),
  ).toMatchInlineSnapshot(`
    {
      "inputs": [
        {
          "name": "x",
          "type": "uint256[3]",
        },
      ],
      "name": "foo",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function",
    }
  `)
})

test('overloads: tuple object with array component', () => {
  const abi = parseAbi([
    'function foo((uint256[] a) x)',
    'function foo((uint256[] a, uint256 b) x)',
  ])

  expect(
    getAbiItem({
      abi,
      name: 'foo',
      args: [{ a: [1n], b: 2n }],
    }),
  ).toMatchInlineSnapshot(`
    {
      "inputs": [
        {
          "components": [
            {
              "name": "a",
              "type": "uint256[]",
            },
            {
              "name": "b",
              "type": "uint256",
            },
          ],
          "name": "x",
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

test('overloads: tuple object keys in a different order', () => {
  const abi = parseAbi([
    'function foo((address a, string b) x)',
    'function foo((string a, string b) x)',
  ])

  expect(
    getAbiItem({
      abi,
      name: 'foo',
      args: [{ b: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e', a: 'hello' }],
    }),
  ).toMatchInlineSnapshot(`
    {
      "inputs": [
        {
          "components": [
            {
              "name": "a",
              "type": "string",
            },
            {
              "name": "b",
              "type": "string",
            },
          ],
          "name": "x",
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
                {
                  name: 'c',
                  type: 'tuple',
                  components: [
                    { name: 'merp', type: 'string' },
                    { name: 'meep', type: 'string' },
                  ],
                },
                {
                  name: 'd',
                  type: 'tuple',
                  components: [
                    { name: 'merp', type: 'string' },
                    { name: 'meep', type: 'string' },
                  ],
                },
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

test('overloads: ambiguious types', () => {
  expect(() =>
    getAbiItem({
      abi: parseAbi(['function foo(address)', 'function foo(bytes20)']),
      name: 'foo',
      args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [AbiItemAmbiguityError: Found ambiguous types in overloaded ABI items.

    \`bytes20\` in \`foo(bytes20)\`, and
    \`address\` in \`foo(address)\`

    These types encode differently and cannot be distinguished at runtime.
    Remove one of the ambiguous items in the ABI.

    Version: viem@x.y.z]
  `)

  expect(() =>
    getAbiItem({
      abi: parseAbi([
        'function foo(string)',
        'function foo(uint)',
        'function foo(address)',
      ]),
      name: 'foo',
      args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [AbiItemAmbiguityError: Found ambiguous types in overloaded ABI items.

    \`address\` in \`foo(address)\`, and
    \`string\` in \`foo(string)\`

    These types encode differently and cannot be distinguished at runtime.
    Remove one of the ambiguous items in the ABI.

    Version: viem@x.y.z]
  `)

  expect(
    getAbiItem({
      abi: parseAbi([
        'function foo(string)',
        'function foo(uint)',
        'function foo(address)',
      ]),
      name: 'foo',
      // 21 bytes (invalid address)
      args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251eee'],
    }),
  ).toMatchInlineSnapshot(`
    {
      "inputs": [
        {
          "type": "string",
        },
      ],
      "name": "foo",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function",
    }
  `)

  expect(
    getAbiItem({
      abi: parseAbi([
        'function foo(string)',
        'function foo(uint)',
        'function foo(address)',
      ]),
      name: 'foo',
      // non-hex (invalid address)
      args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251z'],
    }),
  ).toMatchInlineSnapshot(`
    {
      "inputs": [
        {
          "type": "string",
        },
      ],
      "name": "foo",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function",
    }
  `)

  expect(() =>
    getAbiItem({
      abi: parseAbi([
        'function foo(address)',
        'function foo(uint)',
        'function foo(string)',
      ]),
      name: 'foo',
      args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [AbiItemAmbiguityError: Found ambiguous types in overloaded ABI items.

    \`string\` in \`foo(string)\`, and
    \`address\` in \`foo(address)\`

    These types encode differently and cannot be distinguished at runtime.
    Remove one of the ambiguous items in the ABI.

    Version: viem@x.y.z]
  `)

  expect(() =>
    getAbiItem({
      abi: parseAbi(['function foo((address))', 'function foo((bytes20))']),
      name: 'foo',
      args: [['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e']],
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [AbiItemAmbiguityError: Found ambiguous types in overloaded ABI items.

    \`bytes20\` in \`foo((bytes20))\`, and
    \`address\` in \`foo((address))\`

    These types encode differently and cannot be distinguished at runtime.
    Remove one of the ambiguous items in the ABI.

    Version: viem@x.y.z]
  `)

  expect(() =>
    getAbiItem({
      abi: parseAbi(['function foo(address[])', 'function foo(bytes20[])']),
      name: 'foo',
      args: [['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e']],
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [AbiItemAmbiguityError: Found ambiguous types in overloaded ABI items.

    \`bytes20\` in \`foo(bytes20[])\`, and
    \`address\` in \`foo(address[])\`

    These types encode differently and cannot be distinguished at runtime.
    Remove one of the ambiguous items in the ABI.

    Version: viem@x.y.z]
  `)

  expect(() =>
    getAbiItem({
      abi: parseAbi(['function foo(address[])', 'function foo(bytes20[])']),
      name: 'foo',
      args: [[]],
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [AbiItemAmbiguityError: Found ambiguous types in overloaded ABI items.

    \`bytes20\` in \`foo(bytes20[])\`, and
    \`address\` in \`foo(address[])\`

    These types encode differently and cannot be distinguished at runtime.
    Remove one of the ambiguous items in the ABI.

    Version: viem@x.y.z]
  `)

  expect(() =>
    getAbiItem({
      abi: parseAbi(['function foo(address[])', 'function foo(string[])']),
      name: 'foo',
      args: [[]],
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [AbiItemAmbiguityError: Found ambiguous types in overloaded ABI items.

    \`string\` in \`foo(string[])\`, and
    \`address\` in \`foo(address[])\`

    These types encode differently and cannot be distinguished at runtime.
    Remove one of the ambiguous items in the ABI.

    Version: viem@x.y.z]
  `)

  expect(() =>
    getAbiItem({
      abi: parseAbi(['function foo(address[2])', 'function foo(bytes20[])']),
      name: 'foo',
      args: [
        [
          '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
          '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
        ],
      ],
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [AbiItemAmbiguityError: Found ambiguous types in overloaded ABI items.

    \`bytes20\` in \`foo(bytes20[])\`, and
    \`address\` in \`foo(address[2])\`

    These types encode differently and cannot be distinguished at runtime.
    Remove one of the ambiguous items in the ABI.

    Version: viem@x.y.z]
  `)

  expect(() =>
    getAbiItem({
      abi: parseAbi([
        'function foo((address[] a))',
        'function foo((bytes20[] a))',
      ]),
      name: 'foo',
      args: [{ a: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'] }],
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [AbiItemAmbiguityError: Found ambiguous types in overloaded ABI items.

    \`bytes20\` in \`foo((bytes20[]))\`, and
    \`address\` in \`foo((address[]))\`

    These types encode differently and cannot be distinguished at runtime.
    Remove one of the ambiguous items in the ABI.

    Version: viem@x.y.z]
  `)

  expect(() =>
    getAbiItem({
      abi: parseAbi([
        'function foo((uint256), address[])',
        'function foo((uint256), bytes20[])',
      ]),
      name: 'foo',
      args: [[1n], ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e']],
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [AbiItemAmbiguityError: Found ambiguous types in overloaded ABI items.

    \`bytes20\` in \`foo((uint256),bytes20[])\`, and
    \`address\` in \`foo((uint256),address[])\`

    These types encode differently and cannot be distinguished at runtime.
    Remove one of the ambiguous items in the ABI.

    Version: viem@x.y.z]
  `)

  expect(() =>
    getAbiItem({
      abi: parseAbi([
        'function foo(string, (address))',
        'function foo(string, (bytes))',
      ]),
      name: 'foo',
      args: ['foo', ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e']],
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [AbiItemAmbiguityError: Found ambiguous types in overloaded ABI items.

    \`bytes\` in \`foo(string,(bytes))\`, and
    \`address\` in \`foo(string,(address))\`

    These types encode differently and cannot be distinguished at runtime.
    Remove one of the ambiguous items in the ABI.

    Version: viem@x.y.z]
  `)
})

test('overloads: bytes32 vs bytes', () => {
  expect(() =>
    getAbiItem({
      abi: parseAbi([
        'function isValidSignature(bytes32 hash, bytes signature)',
        'function isValidSignature(bytes data, bytes signature)',
      ]),
      name: 'isValidSignature',
      args: [
        '0x0000000000000000000000000000000000000000000000000000000000000001',
        '0x1234',
      ],
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [AbiItemAmbiguityError: Found ambiguous types in overloaded ABI items.

    \`bytes\` in \`isValidSignature(bytes,bytes)\`, and
    \`bytes32\` in \`isValidSignature(bytes32,bytes)\`

    These types encode differently and cannot be distinguished at runtime.
    Remove one of the ambiguous items in the ABI.

    Version: viem@x.y.z]
  `)
})

test('overloads: uint256 vs int256', () => {
  expect(() =>
    getAbiItem({
      abi: parseAbi(['function foo(uint256 x)', 'function foo(int256 x)']),
      name: 'foo',
      args: [1n],
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [AbiItemAmbiguityError: Found ambiguous types in overloaded ABI items.

    \`int256\` in \`foo(int256)\`, and
    \`uint256\` in \`foo(uint256)\`

    These types encode differently and cannot be distinguished at runtime.
    Remove one of the ambiguous items in the ABI.

    Version: viem@x.y.z]
  `)
})

test('overloads: uint256[] vs uint256[2]', () => {
  expect(() =>
    getAbiItem({
      abi: parseAbi([
        'function foo(uint256[] x)',
        'function foo(uint256[2] x)',
      ]),
      name: 'foo',
      args: [[1n, 1n]],
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [AbiItemAmbiguityError: Found ambiguous types in overloaded ABI items.

    \`uint256[2]\` in \`foo(uint256[2])\`, and
    \`uint256[]\` in \`foo(uint256[])\`

    These types encode differently and cannot be distinguished at runtime.
    Remove one of the ambiguous items in the ABI.

    Version: viem@x.y.z]
  `)

  expect(
    getAbiItem({
      abi: parseAbi([
        'function foo(uint256[] x)',
        'function foo(uint256[2] x)',
      ]),
      name: 'foo',
      args: [[1n, 1n, 1n]],
    }),
  ).toMatchInlineSnapshot(`
    {
      "inputs": [
        {
          "name": "x",
          "type": "uint256[]",
        },
      ],
      "name": "foo",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function",
    }
  `)
})

test('overloads: uint256[2][] vs uint256[][2]', () => {
  expect(() =>
    getAbiItem({
      abi: parseAbi([
        'function foo(uint256[2][] x)',
        'function foo(uint256[][2] x)',
      ]),
      name: 'foo',
      args: [
        [
          [1n, 1n],
          [1n, 1n],
        ],
      ],
    }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [AbiItemAmbiguityError: Found ambiguous types in overloaded ABI items.

    \`uint256[]\` in \`foo(uint256[][2])\`, and
    \`uint256[2]\` in \`foo(uint256[2][])\`

    These types encode differently and cannot be distinguished at runtime.
    Remove one of the ambiguous items in the ABI.

    Version: viem@x.y.z]
  `)
})

test('overloads: selector chooses one of two matches', () => {
  expect(
    getAbiItem({
      abi: parseAbi([
        'function isValidSignature(bytes32 hash, bytes signature)',
        'function isValidSignature(bytes data, bytes signature)',
      ]),
      name: '0x1626ba7e',
      args: [
        '0x0000000000000000000000000000000000000000000000000000000000000001',
        '0x1234',
      ],
    }),
  ).toMatchInlineSnapshot(`
    {
      "inputs": [
        {
          "name": "hash",
          "type": "bytes32",
        },
        {
          "name": "signature",
          "type": "bytes",
        },
      ],
      "name": "isValidSignature",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function",
    }
  `)
})

describe('getAmbiguousTypes', () => {
  test('string/address', () => {
    expect(
      getAmbiguousTypes(
        parseAbiParameters('string'),
        parseAbiParameters('address'),
        ['0xA0Cf798816D4b9b9866b5330EEa46a18382f2522'],
      ),
    ).toMatchInlineSnapshot(`
      [
        "string",
        "address",
      ]
    `)

    expect(
      getAmbiguousTypes(
        parseAbiParameters('string'),
        parseAbiParameters('address'),
        // 21 bytes (invalid address)
        ['0xA0Cf798816D4b9b9866b5330EEa46a18382f252223'],
      ),
    ).toBeUndefined()

    expect(
      getAmbiguousTypes(
        parseAbiParameters('(string)'),
        parseAbiParameters('(address)'),
        [['0xA0Cf798816D4b9b9866b5330EEa46a18382f2522']],
      ),
    ).toMatchInlineSnapshot(`
      [
        "string",
        "address",
      ]
    `)

    expect(
      getAmbiguousTypes(
        parseAbiParameters('(address)'),
        parseAbiParameters('(string)'),
        [['0xA0Cf798816D4b9b9866b5330EEa46a18382f2522']],
      ),
    ).toMatchInlineSnapshot(`
      [
        "address",
        "string",
      ]
    `)

    expect(
      getAmbiguousTypes(
        parseAbiParameters('uint, (string, (string))'),
        parseAbiParameters('uint, (string, (address))'),
        [69420n, ['lol', ['0xA0Cf798816D4b9b9866b5330EEa46a18382f2522']]],
      ),
    ).toMatchInlineSnapshot(`
      [
        "string",
        "address",
      ]
    `)
  })

  test('bytes/address', () => {
    expect(
      getAmbiguousTypes(
        parseAbiParameters('address'),
        parseAbiParameters('bytes20'),
        ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
      ),
    ).toMatchInlineSnapshot(`
      [
        "address",
        "bytes20",
      ]
    `)

    expect(
      getAmbiguousTypes(
        parseAbiParameters('bytes20'),
        parseAbiParameters('address'),
        ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
      ),
    ).toMatchInlineSnapshot(`
      [
        "bytes20",
        "address",
      ]
    `)

    expect(
      getAmbiguousTypes(
        parseAbiParameters('address'),
        parseAbiParameters('bytes'),
        ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
      ),
    ).toMatchInlineSnapshot(`
      [
        "address",
        "bytes",
      ]
    `)

    expect(
      getAmbiguousTypes(
        parseAbiParameters('bytes'),
        parseAbiParameters('address'),
        // 21 bytes (invalid address)
        ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251eee'],
      ),
    ).toBeUndefined()

    expect(
      getAmbiguousTypes(
        parseAbiParameters('bytes'),
        parseAbiParameters('address'),
        ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
      ),
    ).toMatchInlineSnapshot(`
      [
        "bytes",
        "address",
      ]
    `)

    expect(
      getAmbiguousTypes(
        parseAbiParameters('(address)'),
        parseAbiParameters('(bytes20)'),
        [['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e']],
      ),
    ).toMatchInlineSnapshot(`
      [
        "address",
        "bytes20",
      ]
    `)

    expect(
      getAmbiguousTypes(
        parseAbiParameters('uint256, (address)'),
        parseAbiParameters('uint256, (bytes20)'),
        [69420n, ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e']],
      ),
    ).toMatchInlineSnapshot(`
      [
        "address",
        "bytes20",
      ]
    `)
    expect(
      getAmbiguousTypes(
        parseAbiParameters('uint256, (string, (address))'),
        parseAbiParameters('uint256, (string, (bytes20))'),
        [69420n, ['foo', ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e']]],
      ),
    ).toMatchInlineSnapshot(`
      [
        "address",
        "bytes20",
      ]
    `)
    expect(
      getAmbiguousTypes(
        parseAbiParameters('uint256, (string, (address, bytes))'),
        parseAbiParameters('uint256, (string, (bytes20, address))'),
        [
          123n,
          [
            'foo',
            [
              '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
              '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
            ],
          ],
        ],
      ),
    ).toMatchInlineSnapshot(`
      [
        "address",
        "bytes20",
      ]
    `)
  })

  test('bytes', () => {
    expect(
      getAmbiguousTypes(
        parseAbiParameters('bytes32'),
        parseAbiParameters('bytes'),
        ['0x0000000000000000000000000000000000000000000000000000000000000001'],
      ),
    ).toMatchInlineSnapshot(`
      [
        "bytes32",
        "bytes",
      ]
    `)
  })

  test('integers', () => {
    expect(
      getAmbiguousTypes(
        parseAbiParameters('uint256'),
        parseAbiParameters('int256'),
        [1n],
      ),
    ).toMatchInlineSnapshot(`
      [
        "uint256",
        "int256",
      ]
    `)

    expect(
      getAmbiguousTypes(
        parseAbiParameters('uint256'),
        parseAbiParameters('uint128'),
        [69420n],
      ),
    ).toMatchInlineSnapshot(`
      [
        "uint256",
        "uint128",
      ]
    `)
  })

  test('arrays', () => {
    expect(
      getAmbiguousTypes(
        parseAbiParameters('address[]'),
        parseAbiParameters('bytes20[]'),
        [['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e']],
      ),
    ).toMatchInlineSnapshot(`
      [
        "address",
        "bytes20",
      ]
    `)

    expect(
      getAmbiguousTypes(
        parseAbiParameters('address[]'),
        parseAbiParameters('bytes20[]'),
        [[]],
      ),
    ).toMatchInlineSnapshot(`
      [
        "address",
        "bytes20",
      ]
    `)

    expect(
      getAmbiguousTypes(
        parseAbiParameters('string[2]'),
        parseAbiParameters('address[]'),
        [
          [
            '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
            '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
          ],
        ],
      ),
    ).toMatchInlineSnapshot(`
      [
        "string",
        "address",
      ]
    `)

    expect(
      getAmbiguousTypes(
        parseAbiParameters('(address[] a)'),
        parseAbiParameters('(bytes20[] a)'),
        [{ a: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'] }],
      ),
    ).toMatchInlineSnapshot(`
      [
        "address",
        "bytes20",
      ]
    `)

    expect(
      getAmbiguousTypes(
        parseAbiParameters('string[]'),
        parseAbiParameters('address[]'),
        [['foo', 'bar']],
      ),
    ).toBeUndefined()

    expect(
      getAmbiguousTypes(
        parseAbiParameters('string[]'),
        parseAbiParameters('address[]'),
        [[]],
      ),
    ).toMatchInlineSnapshot(`
      [
        "string",
        "address",
      ]
    `)

    expect(
      getAmbiguousTypes(
        parseAbiParameters('address[][]'),
        parseAbiParameters('bytes20[][]'),
        [[['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e']]],
      ),
    ).toMatchInlineSnapshot(`
      [
        "address",
        "bytes20",
      ]
    `)
  })
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
  { arg: [1n], abiParameter: { type: 'uint160[]' }, expected: true },
  { arg: [1, 2], abiParameter: { type: 'int40[2]' }, expected: true },
  { arg: [1n, 2n, 3n], abiParameter: { type: 'uint256[2]' }, expected: false },
  { arg: [[1n]], abiParameter: { type: 'uint120[][]' }, expected: true },
  {
    arg: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
    abiParameter: { type: 'bytes20[]' },
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
  { arg: 'foo', abiParameter: { type: 'bytes32' }, expected: false },
  { arg: toBytes('foo'), abiParameter: { type: 'bytes' }, expected: true },
  { arg: 1, abiParameter: { type: 'bytes32' }, expected: false },
  { arg: '0x1234', abiParameter: { type: 'bytes2' }, expected: true },
  { arg: '0x1234', abiParameter: { type: 'bytes4' }, expected: false },
  { arg: toBytes('foo'), abiParameter: { type: 'bytes3' }, expected: true },
  { arg: toBytes('foo'), abiParameter: { type: 'bytes4' }, expected: false },
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
  { arg: -129, abiParameter: { type: 'int8' }, expected: false },
  { arg: -128, abiParameter: { type: 'int8' }, expected: true },
  { arg: 127, abiParameter: { type: 'int8' }, expected: true },
  { arg: 128, abiParameter: { type: 'int8' }, expected: false },
  { arg: -1n, abiParameter: { type: 'uint8' }, expected: false },
  { arg: 0n, abiParameter: { type: 'uint8' }, expected: true },
  { arg: 255n, abiParameter: { type: 'uint8' }, expected: true },
  { arg: 256n, abiParameter: { type: 'uint8' }, expected: false },
  { arg: 2n ** 256n - 1n, abiParameter: { type: 'uint256' }, expected: true },
  { arg: 2n ** 256n, abiParameter: { type: 'uint256' }, expected: false },
  { arg: -(2n ** 255n), abiParameter: { type: 'int256' }, expected: true },
  {
    arg: -(2n ** 255n) - 1n,
    abiParameter: { type: 'int256' },
    expected: false,
  },
  { arg: Number.NaN, abiParameter: { type: 'uint256' }, expected: false },
  {
    arg: Number.POSITIVE_INFINITY,
    abiParameter: { type: 'uint256' },
    expected: false,
  },
  { arg: 1.5, abiParameter: { type: 'uint256' }, expected: false },
  {
    arg: Number.MAX_SAFE_INTEGER + 1,
    abiParameter: { type: 'uint256' },
    expected: true,
  },
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
