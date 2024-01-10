import { type Abi, parseAbi } from 'abitype'
import { expectTypeOf, test } from 'vitest'

import { wagmiContractConfig } from '~test/src/abis.js'
import type { AbiItem } from '../../types/contract.js'
import { getAbiItem } from './getAbiItem.js'

test('function', () => {
  const res = getAbiItem({
    abi: wagmiContractConfig.abi,
    name: 'balanceOf',
    args: ['0x'],
  })
  expectTypeOf(res).toEqualTypeOf<{
    readonly inputs: readonly [
      {
        readonly name: 'owner'
        readonly type: 'address'
      },
    ]
    readonly name: 'balanceOf'
    readonly outputs: readonly [
      {
        readonly name: ''
        readonly type: 'uint256'
      },
    ]
    readonly stateMutability: 'view'
    readonly type: 'function'
  }>()
})

test('event', () => {
  const res = getAbiItem({
    abi: wagmiContractConfig.abi,
    name: 'Transfer',
    args: ['0x', '0x', 123n],
  })
  expectTypeOf(res).toEqualTypeOf<{
    readonly anonymous: false
    readonly inputs: readonly [
      {
        readonly indexed: true
        readonly name: 'from'
        readonly type: 'address'
      },
      {
        readonly indexed: true
        readonly name: 'to'
        readonly type: 'address'
      },
      {
        readonly indexed: true
        readonly name: 'tokenId'
        readonly type: 'uint256'
      },
    ]
    readonly name: 'Transfer'
    readonly type: 'event'
  }>()
})

test('defined inline', () => {
  const res = getAbiItem({
    abi: [
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            name: 'from',
            type: 'address',
          },
          { indexed: true, name: 'to', type: 'address' },
          {
            indexed: true,
            name: 'tokenId',
            type: 'uint256',
          },
        ],
        name: 'Transfer',
        type: 'event',
      },
      {
        inputs: [
          { name: 'to', type: 'address' },
          { name: 'tokenId', type: 'uint256' },
        ],
        name: 'approve',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
    name: 'approve',
    args: ['0x', 123n],
  })
  expectTypeOf(res).toEqualTypeOf<{
    readonly inputs: readonly [
      {
        readonly name: 'to'
        readonly type: 'address'
      },
      {
        readonly name: 'tokenId'
        readonly type: 'uint256'
      },
    ]
    readonly name: 'approve'
    readonly outputs: readonly []
    readonly stateMutability: 'nonpayable'
    readonly type: 'function'
  }>()
})

test('declared as Abi', () => {
  const res = getAbiItem({
    abi: wagmiContractConfig.abi as Abi,
    name: 'balanceOf',
    args: ['0x'],
  })
  expectTypeOf(res).toEqualTypeOf<AbiItem | undefined>()
})

test('no const assertion', () => {
  const abi = [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: 'from',
          type: 'address',
        },
        { indexed: true, name: 'to', type: 'address' },
        {
          indexed: true,
          name: 'tokenId',
          type: 'uint256',
        },
      ],
      name: 'Transfer',
      type: 'event',
    },
    {
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'tokenId', type: 'uint256' },
      ],
      name: 'approve',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ]
  const res = getAbiItem({
    abi,
    name: 'approve',
    args: ['0x', 123n],
  })
  expectTypeOf(res).toEqualTypeOf<AbiItem | undefined>()
})

test('overloads', () => {
  const abi = parseAbi([
    'function foo() view returns (int8)',
    'function foo(address) view returns (string)',
    'function foo(address, address) view returns ((address foo, address bar))',
    'function bar() view returns (int8)',
  ])

  const res0 = getAbiItem({
    abi,
    name: 'foo',
  })
  const res1 = getAbiItem({
    abi,
    name: 'foo',
    args: [],
  })
  expectTypeOf(res1).toEqualTypeOf(res0)
  expectTypeOf(res1).toEqualTypeOf<{
    readonly name: 'foo'
    readonly inputs: readonly []
    readonly outputs: readonly [{ readonly type: 'int8' }]
    readonly stateMutability: 'view'
    readonly type: 'function'
  }>()

  const { inputs, ...res2 } = getAbiItem({
    abi,
    name: 'foo',
    args: ['0x', '0x'],
  })
  expectTypeOf(inputs[0].type).toEqualTypeOf<'address'>()
  expectTypeOf(res2).toEqualTypeOf<{
    name: 'foo'
    type: 'function'
    stateMutability: 'view'
    outputs: readonly [
      {
        readonly type: 'tuple'
        readonly components: readonly [
          {
            readonly type: 'address'
            readonly name: 'foo'
          },
          {
            readonly type: 'address'
            readonly name: 'bar'
          },
        ]
      },
    ]
  }>()

  const res3 = getAbiItem({
    abi,
    name: 'foo',
    args: ['0x'],
  })
  expectTypeOf(res3).toEqualTypeOf<{
    readonly name: 'foo'
    readonly type: 'function'
    readonly stateMutability: 'view'
    readonly inputs: readonly [{ readonly type: 'address' }]
    readonly outputs: readonly [{ readonly type: 'string' }]
  }>()
})
