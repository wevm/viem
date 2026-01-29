import { type Abi, parseAbi } from 'abitype'
import { expectTypeOf, test } from 'vitest'

import { wagmiContractConfig } from '~test/src/abis.js'
import {
  type EncodeFunctionResultParameters,
  encodeFunctionResult,
} from './encodeFunctionResult.js'

test('default', () => {
  encodeFunctionResult({
    abi: wagmiContractConfig.abi,
    functionName: 'balanceOf',
    result: 123n,
  })
})

test('defined inline', () => {
  encodeFunctionResult({
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
  })
})

test('declared as Abi', () => {
  encodeFunctionResult({
    abi: wagmiContractConfig.abi as Abi,
    functionName: 'balanceOf',
    result: 123n,
  })

  encodeFunctionResult({
    abi: wagmiContractConfig.abi as Abi,
    result: 123n,
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
  encodeFunctionResult({
    abi,
    functionName: 'balanceOf',
    result: 123n,
  })

  encodeFunctionResult({
    abi,
    result: 123n,
  })
})

test('overloads', () => {
  const abi = parseAbi([
    'function foo() view returns (int8)',
    'function foo(address) view returns (string)',
    'function foo(address, address) view returns ((address foo, address bar))',
    'function bar() view returns (int8)',
  ])

  encodeFunctionResult({
    abi,
    functionName: 'foo',
  })

  encodeFunctionResult({
    abi,
    functionName: 'foo',
    result: 123,
  })

  encodeFunctionResult({
    abi,
    functionName: 'foo',
    result: 'test',
  })

  encodeFunctionResult({
    abi,
    functionName: 'foo',
    result: { foo: '0x', bar: '0x' },
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
  encodeFunctionResult({
    abi,
  })

  type Result = EncodeFunctionResultParameters<typeof abi>
  expectTypeOf<Result['functionName']>().toEqualTypeOf<'approve' | undefined>()
})

test('multiple abi functions, functionName required', () => {
  // @ts-expect-error functionName required
  encodeFunctionResult({
    abi: wagmiContractConfig.abi,
  })

  type Result = EncodeFunctionResultParameters<typeof wagmiContractConfig.abi>
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
  })
})
