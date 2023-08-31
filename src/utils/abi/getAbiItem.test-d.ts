import { type Abi, parseAbi } from 'abitype'
import { expectTypeOf, test } from 'vitest'

import { wagmiContractConfig } from '../../_test/abis.js'
import type { AbiItem } from '../../types/contract.js'
import { getAbiItem } from './getAbiItem.js'

test('function', () => {
  const res = getAbiItem({
    abi: wagmiContractConfig.abi,
    name: 'balanceOf',
    args: ['0x'],
  })
  expectTypeOf(res).toEqualTypeOf<{
    readonly name: 'balanceOf'
    readonly inputs: readonly [{ name: 'account'; type: 'address' }]
    readonly outputs: readonly [{ type: 'uint256' }]
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
    readonly name: 'Transfer'
    readonly inputs: readonly [
      { indexed: true; name: 'from'; type: 'address' },
      { indexed: true; name: 'to'; type: 'address' },
      { indexed: false; name: 'value'; type: 'uint256' },
    ]
    readonly anonymous: false
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
    readonly name: 'approve'
    readonly inputs: readonly [
      { name: 'to'; type: 'address' },
      { name: 'tokenId'; type: 'uint256' },
    ]
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
  expectTypeOf(res0).toEqualTypeOf<{
    readonly name: 'foo'
    readonly inputs: readonly []
    readonly outputs: readonly [{ type: 'int8' }]
    readonly stateMutability: 'view'
    readonly type: 'function'
  }>()
  const res1 = getAbiItem({
    abi,
    name: 'foo',
    args: [],
  })
  expectTypeOf(res1).toEqualTypeOf(res0)

  const res2 = getAbiItem({
    abi,
    name: 'foo',
    args: ['0x', '0x'],
  })
  expectTypeOf(res2).toEqualTypeOf<{
    readonly name: 'foo'
    readonly inputs: readonly [{ type: 'address' }, { type: 'address' }]
    readonly outputs: readonly [
      {
        readonly type: 'tuple'
        readonly components: readonly [
          { name: 'foo'; type: 'address' },
          { name: 'bar'; type: 'address' },
        ]
      },
    ]
    readonly stateMutability: 'view'
    readonly type: 'function'
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
