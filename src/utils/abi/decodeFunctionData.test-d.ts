import type { Abi } from 'abitype'
import { expectTypeOf, test } from 'vitest'

import { wagmiContractConfig } from '~test/src/abis.js'
import { decodeFunctionData } from './decodeFunctionData.js'

test('default', () => {
  const res = decodeFunctionData({
    abi: wagmiContractConfig.abi,
    data: '0x',
  })
  expectTypeOf(res).toEqualTypeOf<
    | {
        args: readonly []
        functionName: 'symbol'
      }
    | {
        args: readonly [`0x${string}`, bigint]
        functionName: 'approve'
      }
    | {
        args: readonly [`0x${string}`]
        functionName: 'balanceOf'
      }
    | {
        args: readonly [bigint]
        functionName: 'getApproved'
      }
    | {
        args: readonly [`0x${string}`, `0x${string}`]
        functionName: 'isApprovedForAll'
      }
    | {
        args: readonly [] | readonly [bigint]
        functionName: 'mint'
      }
    | {
        args: readonly []
        functionName: 'name'
      }
    | {
        args: readonly [bigint]
        functionName: 'ownerOf'
      }
    | {
        args:
          | readonly [`0x${string}`, `0x${string}`, bigint]
          | readonly [`0x${string}`, `0x${string}`, bigint, `0x${string}`]
        functionName: 'safeTransferFrom'
      }
    | {
        args: readonly [`0x${string}`, boolean]
        functionName: 'setApprovalForAll'
      }
    | {
        args: readonly [`0x${string}`]
        functionName: 'supportsInterface'
      }
    | {
        args: readonly [bigint]
        functionName: 'tokenURI'
      }
    | {
        args: readonly []
        functionName: 'totalSupply'
      }
    | {
        args: readonly [`0x${string}`, `0x${string}`, bigint]
        functionName: 'transferFrom'
      }
  >()
})

test('defined inline', () => {
  const res = decodeFunctionData({
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
    data: '0x',
  })
  expectTypeOf(res).toEqualTypeOf<{
    args: readonly [`0x${string}`, bigint]
    functionName: 'approve'
  }>()
})

test('declared as Abi', () => {
  const res = decodeFunctionData({
    abi: wagmiContractConfig.abi as Abi,
    data: '0x',
  })
  expectTypeOf(res).toEqualTypeOf<{
    args: readonly unknown[] | undefined
    functionName: string
  }>()
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

  const res = decodeFunctionData({
    abi,
    data: '0x',
  })
  expectTypeOf(res).toEqualTypeOf<{
    args: readonly unknown[] | undefined
    functionName: string
  }>()
})
