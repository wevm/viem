import { parseAbi } from 'abitype'
import { assertType, expectTypeOf, test } from 'vitest'

import { wagmiContractConfig } from '../../_test/abis.js'
import { publicClient } from '../../_test/utils.js'
import { simulateContract } from './simulateContract.js'

const args = {
  ...wagmiContractConfig,
  account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  functionName: 'mint',
  args: [69420n],
} as const

test('legacy', () => {
  simulateContract(publicClient, {
    ...args,
    gasPrice: 0n,
  })

  // @ts-expect-error
  simulateContract(publicClient, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  simulateContract(publicClient, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  })
  // @ts-expect-error
  simulateContract(publicClient, {
    ...args,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  })
})

test('eip1559', () => {
  simulateContract(publicClient, {
    ...args,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  simulateContract(publicClient, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  simulateContract(publicClient, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip1559',
  })
  // @ts-expect-error
  simulateContract(publicClient, {
    ...args,
    gasPrice: 0n,
    type: 'eip1559',
  })
})

test('eip2930', () => {
  simulateContract(publicClient, {
    ...args,
    accessList: [],
    gasPrice: 0n,
  })

  // @ts-expect-error
  simulateContract(publicClient, {
    ...args,
    accessList: [],
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  simulateContract(publicClient, {
    ...args,
    accessList: [],
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  })
  // @ts-expect-error
  simulateContract(publicClient, {
    ...args,
    accessList: [],
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  })
})

test('overloads', async () => {
  const abi = parseAbi([
    'function foo() returns (int8)',
    'function foo(address) returns (string)',
    'function foo(address, address) returns ((address foo, address bar))',
    'function bar() returns (int8)',
  ])

  const res1 = await simulateContract(publicClient, {
    address: '0x',
    abi,
    functionName: 'foo',
  })
  assertType<number>(res1.result)
  expectTypeOf(res1.request.abi).toEqualTypeOf(
    parseAbi(['function foo() returns (int8)']),
  )

  const res2 = await simulateContract(publicClient, {
    address: '0x',
    abi,
    functionName: 'foo',
    args: ['0x'],
  })
  assertType<string>(res2.result)
  expectTypeOf(res2.request.abi).toEqualTypeOf(
    parseAbi(['function foo(address) returns (string)']),
  )

  const res3 = await simulateContract(publicClient, {
    address: '0x',
    abi,
    functionName: 'foo',
    args: ['0x', '0x'],
  })
  assertType<{
    foo: `0x${string}`
    bar: `0x${string}`
  }>(res3.result)
  expectTypeOf(res3.request.abi).toEqualTypeOf(
    parseAbi([
      'function foo(address, address) returns ((address foo, address bar))',
    ]),
  )
})
