import { parseAbi } from 'abitype'
import { assertType, expectTypeOf, test } from 'vitest'

import { baycContractConfig, wagmiContractConfig } from '~test/src/abis.js'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { celo } from '../../chains/definitions/celo.js'

import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import { simulateContract } from './simulateContract.js'

const args = {
  ...wagmiContractConfig,
  functionName: 'mint',
  args: [69420n],
} as const

const client = anvilMainnet.getClient()
const clientWithAccount = anvilMainnet.getClient({ account: true })

test('args: account - no client account, no account arg', async () => {
  const result = await simulateContract(client, {
    ...args,
  })

  expectTypeOf<Pick<(typeof result)['request'], 'account'>>().toEqualTypeOf<{
    account?: undefined
  }>()
})

test('args: account - no client account, nullish account arg', async () => {
  const result = await simulateContract(client, {
    ...args,
    account: null,
  })

  expectTypeOf<Pick<(typeof result)['request'], 'account'>>().toEqualTypeOf<{
    account: null
  }>()
})

test('args: account - with client account, no account arg', async () => {
  const result = await simulateContract(clientWithAccount, {
    ...args,
  })

  expectTypeOf<Pick<(typeof result)['request'], 'account'>>().toEqualTypeOf<{
    account: (typeof clientWithAccount)['account']
  }>()
})

test('args: account - with client account, nullish account arg', async () => {
  const result = await simulateContract(clientWithAccount, {
    ...args,
    account: null,
  })

  expectTypeOf<Pick<(typeof result)['request'], 'account'>>().toEqualTypeOf<{
    account: null
  }>()
})

test('args: account - no client account, with account arg', async () => {
  const result = await simulateContract(client, {
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
  const result = await simulateContract(clientWithAccount, {
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

test('args: value', () => {
  // payable function
  simulateContract(clientWithAccount, {
    abi: baycContractConfig.abi,
    address: '0x',
    functionName: 'mintApe',
    args: [69n],
    value: 5n,
  })

  // payable function (undefined)
  simulateContract(clientWithAccount, {
    abi: baycContractConfig.abi,
    address: '0x',
    functionName: 'mintApe',
    args: [69n],
  })

  // nonpayable function
  simulateContract(clientWithAccount, {
    abi: baycContractConfig.abi,
    address: '0x',
    functionName: 'approve',
    // @ts-expect-error
    value: 5n,
  })
})

test('args: legacy txn', () => {
  simulateContract(client, {
    ...args,
    gasPrice: 0n,
  })

  // @ts-expect-error
  simulateContract(client, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  simulateContract(client, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  })
  // @ts-expect-error
  simulateContract(client, {
    ...args,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  })
})

test('args: eip1559 txn', () => {
  simulateContract(client, {
    ...args,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  simulateContract(client, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  simulateContract(client, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip1559',
  })
  // @ts-expect-error
  simulateContract(client, {
    ...args,
    gasPrice: 0n,
    type: 'eip1559',
  })
})

test('args: eip2930 txn', () => {
  simulateContract(client, {
    ...args,
    accessList: [],
    gasPrice: 0n,
  })

  // @ts-expect-error
  simulateContract(client, {
    ...args,
    accessList: [],
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  simulateContract(client, {
    ...args,
    accessList: [],
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  })
  // @ts-expect-error
  simulateContract(client, {
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

  const res1 = await simulateContract(client, {
    address: '0x',
    abi,
    functionName: 'foo',
  })
  assertType<number>(res1.result)
  expectTypeOf(res1.request.abi).toEqualTypeOf(
    parseAbi(['function foo() returns (int8)']),
  )

  const res2 = await simulateContract(client, {
    address: '0x',
    abi,
    functionName: 'foo',
    args: ['0x'],
  })
  assertType<string>(res2.result)
  expectTypeOf(res2.request.abi).toEqualTypeOf(
    parseAbi(['function foo(address) returns (string)']),
  )

  const res3 = await simulateContract(client, {
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

test('https://github.com/wevm/viem/issues/2531', async () => {
  const abi = parseAbi([
    'function safeTransferFrom(address, address, uint256)',
    'function safeTransferFrom(address, address, uint256, bytes) payable',
  ])

  const res1 = await simulateContract(client, {
    address: '0x',
    abi,
    functionName: 'safeTransferFrom',
    args: ['0x', '0x', 123n],
    // @ts-expect-error
    value: 123n,
  })
  assertType<void>(res1.result)
  expectTypeOf(res1.request.abi).toEqualTypeOf(
    parseAbi(['function safeTransferFrom(address, address, uint256)']),
  )

  const res2 = await simulateContract(client, {
    address: '0x',
    abi,
    functionName: 'safeTransferFrom',
    args: ['0x', '0x', 123n, '0x'],
    value: 123n,
  })
  assertType<void>(res2.result)
  expectTypeOf(res2.request.abi).toEqualTypeOf(
    parseAbi([
      'function safeTransferFrom(address, address, uint256, bytes) payable',
    ]),
  )
})
