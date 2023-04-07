import type { Abi, ResolvedConfig } from 'abitype'
import { parseAbi } from 'abitype'
import {
  address,
  wagmiMintExampleAbi,
  wagmiMintExampleHumanReadableAbi,
  writingEditionsFactoryAbi,
} from 'abitype/test'
import { assertType, expectTypeOf, test } from 'vitest'

import { publicClient } from '../../_test/index.js'
import type { ReadContractParameters } from './readContract.js'
import { readContract } from './readContract.js'

test('ReadContractParameters', () => {
  type Result = ReadContractParameters<typeof wagmiMintExampleAbi, 'tokenURI'>
  expectTypeOf<Result['functionName']>().toEqualTypeOf<
    | 'symbol'
    | 'name'
    | 'balanceOf'
    | 'getApproved'
    | 'isApprovedForAll'
    | 'ownerOf'
    | 'supportsInterface'
    | 'tokenURI'
    | 'totalSupply'
  >()
  expectTypeOf<Result['args']>().toEqualTypeOf<readonly [bigint]>()
})

test('args', () => {
  test('zero', async () => {
    const result = await readContract(publicClient, {
      address,
      abi: wagmiMintExampleAbi,
      functionName: 'name',
    })
    assertType<string>(result)
  })

  test('one', async () => {
    const result = await readContract(publicClient, {
      address,
      abi: wagmiMintExampleAbi,
      functionName: 'tokenURI',
      args: [123n],
    })
    assertType<string>(result)
  })

  test('two or more', async () => {
    const result = await readContract(publicClient, {
      address,
      abi: writingEditionsFactoryAbi,
      functionName: 'predictDeterministicAddress',
      args: [address, '0xfoo'],
    })
    assertType<ResolvedConfig['AddressType']>(result)
  })
})

test('return types', () => {
  test('string', async () => {
    const result = await readContract(publicClient, {
      address,
      abi: wagmiMintExampleAbi,
      functionName: 'name',
    })
    assertType<string>(result)
  })

  test('Address', async () => {
    const result = await readContract(publicClient, {
      address,
      abi: wagmiMintExampleAbi,
      functionName: 'ownerOf',
      args: [123n],
    })
    assertType<ResolvedConfig['AddressType']>(result)
  })

  test('number', async () => {
    const result = await readContract(publicClient, {
      address,
      abi: wagmiMintExampleAbi,
      functionName: 'balanceOf',
      args: [address],
    })
    assertType<ResolvedConfig['BigIntType']>(result)
  })
})

test('behavior', () => {
  test('write function not allowed', async () => {
    const result = await readContract(publicClient, {
      address,
      abi: wagmiMintExampleAbi,
      // @ts-expect-error Trying to use non-read function
      functionName: 'approve',
    })
    assertType<void>(result)
  })

  test('without const assertion', async () => {
    const abi = [
      {
        name: 'foo',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'string', name: '' }],
      },
      {
        name: 'bar',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ type: 'address', name: '' }],
        outputs: [{ type: 'address', name: '' }],
      },
    ]
    const result1 = await readContract(publicClient, {
      address,
      abi: abi,
      functionName: 'foo',
    })
    const result2 = await readContract(publicClient, {
      address,
      abi: abi,
      functionName: 'bar',
      args: [address],
    })
    type Result1 = typeof result1
    type Result2 = typeof result2
    assertType<Result1>('hello')
    assertType<Result2>('0x123')
  })

  test('declared as Abi type', async () => {
    const abi: Abi = [
      {
        name: 'foo',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'string', name: '' }],
      },
      {
        name: 'bar',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ type: 'address', name: '' }],
        outputs: [{ type: 'address', name: '' }],
      },
    ]
    const result1 = await readContract(publicClient, {
      address,
      abi: abi,
      functionName: 'foo',
    })
    const result2 = await readContract(publicClient, {
      address,
      abi: abi,
      functionName: 'bar',
      args: [address],
    })
    type Result1 = typeof result1
    type Result2 = typeof result2
    assertType<Result1>('hello')
    assertType<Result2>('0x123')
  })

  test('defined inline', async () => {
    const result1 = await readContract(publicClient, {
      address,
      abi: [
        {
          name: 'foo',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ type: 'string', name: '' }],
        },
        {
          name: 'bar',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ type: 'address', name: '' }],
          outputs: [{ type: 'address', name: '' }],
        },
      ],
      functionName: 'foo',
    })
    const result2 = await readContract(publicClient, {
      address,
      abi: [
        {
          name: 'foo',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ type: 'string', name: '' }],
        },
        {
          name: 'bar',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ type: 'address', name: '' }],
          outputs: [{ type: 'address', name: '' }],
        },
      ],
      functionName: 'bar',
      args: [address],
    })
    type Result1 = typeof result1
    type Result2 = typeof result2
    assertType<Result1>('hello')
    assertType<Result2>('0x123')
  })

  test('human readable', async () => {
    const result = await readContract(publicClient, {
      address,
      abi: parseAbi(wagmiMintExampleHumanReadableAbi),
      functionName: 'balanceOf',
      args: [address],
    })
    assertType<bigint>(result)
  })
})
