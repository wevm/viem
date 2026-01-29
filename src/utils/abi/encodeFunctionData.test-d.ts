import { expectTypeOf, test } from 'vitest'

import { type Abi, parseAbi } from 'abitype'
import { wagmiContractConfig } from '~test/src/abis.js'
import type { Hex } from '../../types/misc.js'
import {
  type EncodeFunctionDataParameters,
  encodeFunctionData,
} from './encodeFunctionData.js'

test('default', () => {
  encodeFunctionData({
    abi: wagmiContractConfig.abi,
    functionName: 'balanceOf',
    args: ['0x'],
  })
})

test('defined inline', () => {
  encodeFunctionData({
    abi: [
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
    functionName: 'approve',
    args: ['0x', 123n],
  })
})

test('declared as Abi', () => {
  encodeFunctionData({
    abi: wagmiContractConfig.abi as Abi,
    functionName: 'balanceOf',
    args: ['0x'],
  })

  encodeFunctionData({
    abi: wagmiContractConfig.abi as Abi,
    args: ['0x'],
  })
})

test('no const assertion', () => {
  const abi = [
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
  encodeFunctionData({
    abi,
    functionName: 'balanceOf',
    args: ['0x'],
  })

  encodeFunctionData({
    abi,
    args: ['0x'],
  })
})

test('overloads', () => {
  const abi = parseAbi([
    'function foo() view returns (int8)',
    'function foo(address) view returns (string)',
    'function foo(address, address) view returns ((address foo, address bar))',
    'function bar() view returns (int8)',
  ])

  encodeFunctionData({
    abi,
    functionName: 'foo',
  })

  encodeFunctionData({
    abi,
    functionName: 'foo',
    args: [],
  })

  encodeFunctionData({
    abi,
    functionName: 'foo',
    args: ['0x'],
  })

  encodeFunctionData({
    abi,
    functionName: 'foo',
    args: ['0x', '0x'],
  })
})

test('single abi function, functionName not required', () => {
  const abi = [
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
  ] as const
  encodeFunctionData({
    abi,
    args: ['0x', 123n],
  })

  type Result = EncodeFunctionDataParameters<typeof abi>
  expectTypeOf<Result['functionName']>().toEqualTypeOf<
    'approve' | Hex | undefined
  >()
})

test('multiple abi functions, functionName required', () => {
  // @ts-expect-error functionName required
  encodeFunctionData({
    abi: wagmiContractConfig.abi,
  })

  type Result = EncodeFunctionDataParameters<typeof wagmiContractConfig.abi>
  expectTypeOf<Result['functionName']>().not.toEqualTypeOf<undefined>()
  expectTypeOf<Result['functionName']>().toEqualTypeOf<
    | 'symbol'
    | 'approve'
    | 'name'
    | 'balanceOf'
    | 'getApproved'
    | 'isApprovedForAll'
    | 'mint'
    | 'ownerOf'
    | 'safeTransferFrom'
    | 'setApprovalForAll'
    | 'supportsInterface'
    | 'tokenURI'
    | 'totalSupply'
    | 'transferFrom'
    | Hex
  >()
})

test('abi has no functions', () => {
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
  })
})
