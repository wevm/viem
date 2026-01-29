import { expectTypeOf, test } from 'vitest'

import { type Abi, type Address, parseAbi } from 'abitype'
import { wagmiContractConfig } from '~test/src/abis.js'
import {
  type DecodeFunctionResultParameters,
  decodeFunctionResult,
} from './decodeFunctionResult.js'

test('default', () => {
  const res = decodeFunctionResult({
    abi: wagmiContractConfig.abi,
    functionName: 'balanceOf',
    args: ['0x'],
    data: '0x',
  })
  expectTypeOf(res).toEqualTypeOf<bigint>()
})

test('defined inline', () => {
  const res = decodeFunctionResult({
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
    data: '0x',
  })
  expectTypeOf(res).toEqualTypeOf<void>()
})

test('declared as Abi', () => {
  const res = decodeFunctionResult({
    abi: wagmiContractConfig.abi as Abi,
    functionName: 'balanceOf',
    args: ['0x'],
    data: '0x',
  })
  expectTypeOf(res).toEqualTypeOf<unknown>()

  const res2 = decodeFunctionResult({
    abi: wagmiContractConfig.abi as Abi,
    args: ['0x'],
    data: '0x',
  })
  expectTypeOf(res2).toEqualTypeOf<unknown>()
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
  const res = decodeFunctionResult({
    abi,
    functionName: 'balanceOf',
    args: ['0x'],
    data: '0x',
  })
  expectTypeOf(res).toEqualTypeOf<unknown>()

  const res2 = decodeFunctionResult({
    abi,
    args: ['0x'],
    data: '0x',
  })
  expectTypeOf(res2).toEqualTypeOf<unknown>()
})

test('overloads', () => {
  const abi = parseAbi([
    'function foo() view returns (int8)',
    'function foo(address) view returns (string)',
    'function foo(address, address) view returns ((address foo, address bar))',
    'function bar() view returns (int8)',
  ])

  const res = decodeFunctionResult({
    abi,
    functionName: 'foo',
    data: '0x',
  })
  expectTypeOf(res).toEqualTypeOf<number>()

  const res2 = decodeFunctionResult({
    abi,
    functionName: 'foo',
    args: [],
    data: '0x',
  })
  expectTypeOf(res2).toEqualTypeOf<number>()

  const res3 = decodeFunctionResult({
    abi,
    functionName: 'foo',
    args: ['0x'],
    data: '0x',
  })
  expectTypeOf(res3).toEqualTypeOf<string>()

  const res4 = decodeFunctionResult({
    abi,
    functionName: 'foo',
    args: ['0x', '0x'],
    data: '0x',
  })
  expectTypeOf(res4).toEqualTypeOf<{ foo: Address; bar: Address }>()
})

test('single abi function, functionName not required', () => {
  const abi = [
    {
      inputs: [{ type: 'address' }],
      name: 'balanceOf',
      outputs: [{ type: 'uint256' }],
      stateMutability: 'pure',
      type: 'function',
    },
  ] as const
  const res = decodeFunctionResult({
    abi,
    args: ['0x'],
    data: '0x',
  })
  expectTypeOf(res).toEqualTypeOf<bigint>()

  type Result = DecodeFunctionResultParameters<typeof abi>
  expectTypeOf<Result['functionName']>().toEqualTypeOf<
    'balanceOf' | undefined
  >()
})

test('multiple abi functions, functionName required', () => {
  // @ts-expect-error functionName required
  decodeFunctionResult({
    abi: wagmiContractConfig.abi,
  })

  type Result = DecodeFunctionResultParameters<typeof wagmiContractConfig.abi>
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
  >()
})

test('abi has no functions', () => {
  // @ts-expect-error abi has no functions
  decodeFunctionResult({
    abi: [
      {
        inputs: [],
        name: 'Foo',
        outputs: [],
        type: 'error',
      },
    ],
    data: '0x',
  })
})
