import { parseAbi } from 'abitype'
import { assertType, expectTypeOf, test } from 'vitest'

import { wagmiContractConfig } from '~test/src/abis.js'
import { publicClient, walletClientWithAccount } from '~test/src/utils.js'

import { celo } from '../../chains/definitions/celo.js'
import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import { simulateContract } from './simulateContract.js'

const args = {
  ...wagmiContractConfig,
  functionName: 'mint',
  args: [69420n],
} as const

test('args: account - no client account, no account arg', async () => {
  const result = await simulateContract(publicClient, {
    ...args,
  })

  expectTypeOf<Pick<(typeof result)['request'], 'account'>>().toEqualTypeOf<{
    account?: undefined
  }>()
})

test('args: account - with client account, no account arg', async () => {
  const result = await simulateContract(walletClientWithAccount, {
    ...args,
  })

  expectTypeOf<Pick<(typeof result)['request'], 'account'>>().toEqualTypeOf<{
    account: (typeof walletClientWithAccount)['account']
  }>()
})

test('args: account - no client account, with account arg', async () => {
  const result = await simulateContract(publicClient, {
    ...args,
    account: '0x',
  })

  expectTypeOf<Pick<(typeof result)['request'], 'account'>>().toEqualTypeOf<{
    account: {
      address: '0x'
      type: 'json-rpc'
    }
  }>()
})

test('args: account - with client account, with account arg', async () => {
  const result = await simulateContract(walletClientWithAccount, {
    ...args,
    account: '0x',
  })

  expectTypeOf<Pick<(typeof result)['request'], 'account'>>().toEqualTypeOf<{
    account: {
      address: '0x'
      type: 'json-rpc'
    }
  }>()
})

test('args: legacy txn', () => {
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

test('args: eip1559 txn', () => {
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

test('args: eip2930 txn', () => {
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

test('chain formatters', async () => {
  const client = createClient({
    transport: http(),
    chain: celo,
  })
  const result = await simulateContract(client, {
    ...wagmiContractConfig,
    functionName: 'mint',
    args: [69420n],
    feeCurrency: '0x',
  })

  expectTypeOf(result.request.feeCurrency).toEqualTypeOf<
    `0x${string}` | undefined
  >()

  const result2 = await simulateContract(client, {
    ...wagmiContractConfig,
    functionName: 'mint',
    args: [69420n],
    feeCurrency: '0x',
    chain: celo,
  })

  expectTypeOf(result2.request.feeCurrency).toEqualTypeOf<
    `0x${string}` | undefined
  >()
})
