import { parseAbi } from 'abitype'
import { erc20Abi } from 'abitype/abis'
import { encodeFunctionData } from 'viem'
import { expect, test } from 'vitest'
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

test('overloads: distinguishable values in either ABI order', () => {
  const cases = [
    { types: ['bytes32', 'bytes'], args: ['0x1234'] },
    { types: ['bytes32', 'bytes4'], args: ['0x12345678'] },
    { types: ['uint256', 'int256'], args: [-1n] },
    { types: ['uint8', 'uint256'], args: [256n] },
    { types: ['int8', 'int256'], args: [-129n] },
    { types: ['int8', 'int256'], args: [128n] },
    { types: ['uint256[]', 'int256[]'], args: [[1n, -1n]] },
    {
      types: ['bytes32[]', 'bytes[]'],
      args: [[`0x${'00'.repeat(32)}`, '0x1234']],
    },
    { types: ['(uint256 value)', '(int256 value)'], args: [{ value: -1n }] },
  ]

  expect(
    cases.map(({ types, args }) => {
      const abi = parseAbi(types.map((type) => `function foo(${type})`))

      return [abi, [...abi].reverse()].map((abi) =>
        encodeFunctionData({ abi, functionName: 'foo', args }),
      )
    }),
  ).toMatchInlineSnapshot(`
    [
      [
        "0x30c8d1da000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000",
        "0x30c8d1da000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000",
      ],
      [
        "0x580526ee1234567800000000000000000000000000000000000000000000000000000000",
        "0x580526ee1234567800000000000000000000000000000000000000000000000000000000",
      ],
      [
        "0x4c970b2fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        "0x4c970b2fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      ],
      [
        "0x2fbebd380000000000000000000000000000000000000000000000000000000000000100",
        "0x2fbebd380000000000000000000000000000000000000000000000000000000000000100",
      ],
      [
        "0x4c970b2fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff7f",
        "0x4c970b2fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff7f",
      ],
      [
        "0x4c970b2f0000000000000000000000000000000000000000000000000000000000000080",
        "0x4c970b2f0000000000000000000000000000000000000000000000000000000000000080",
      ],
      [
        "0xdc8ef7a2000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        "0xdc8ef7a2000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      ],
      [
        "0x36fe9f8d00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000",
        "0x36fe9f8d00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000",
      ],
      [
        "0x7a44c75effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        "0x7a44c75effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      ],
    ]
  `)
})

test('overloads: bytes32 vs bytes', () => {
  const hash =
    '0x0000000000000000000000000000000000000000000000000000000000000001'
  const signature = '0x1234'
  const abi = parseAbi([
    'function isValidSignature(bytes32 hash, bytes signature)',
    'function isValidSignature(bytes data, bytes signature)',
  ])

  expect(
    encodeFunctionData({
      abi: parseAbi([
        'function isValidSignature(bytes32 hash, bytes signature)',
      ]),
      functionName: 'isValidSignature',
      args: [hash, signature],
    }),
  ).toMatchInlineSnapshot(
    `"0x1626ba7e0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000"`,
  )

  expect(
    encodeFunctionData({
      abi,
      functionName: '0x1626ba7e',
      args: [hash, signature],
    }),
  ).toMatchInlineSnapshot(
    `"0x1626ba7e0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000"`,
  )

  expect(() =>
    encodeFunctionData({
      abi,
      functionName: 'isValidSignature',
      args: [hash, signature],
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
