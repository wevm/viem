import { seaportAbi } from 'abitype/test'
import { assertType, expectTypeOf, test } from 'vitest'

import { wagmiContractConfig } from '../../_test/abis.js'
import { walletClientWithAccount } from '../../_test/utils.js'
import { type WriteContractParameters, writeContract } from './writeContract.js'

test('WriteContractParameters', async () => {
  type Result = WriteContractParameters<typeof seaportAbi, 'cancel'>
  expectTypeOf<Result['functionName']>().toEqualTypeOf<
    | 'cancel'
    | 'fulfillAdvancedOrder'
    | 'fulfillAvailableAdvancedOrders'
    | 'fulfillAvailableOrders'
    | 'fulfillBasicOrder'
    | 'fulfillBasicOrder_efficient_6GL6yc'
    | 'fulfillOrder'
    | 'incrementCounter'
    | 'matchAdvancedOrders'
    | 'matchOrders'
    | 'validate'
  >()

  const address = '0x' as const
  assertType<WriteContractParameters<typeof seaportAbi, 'cancel'>>({
    abi: seaportAbi,
    account: address,
    address,
    functionName: 'cancel',
    // ^?
    args: [
      [
        {
          offerer: address,
          zone: address,
          offer: [
            {
              itemType: 1,
              token: address,
              identifierOrCriteria: 1n,
              startAmount: 1n,
              endAmount: 1n,
            },
          ],
          consideration: [
            {
              itemType: 1,
              token: address,
              identifierOrCriteria: 1n,
              startAmount: 1n,
              endAmount: 1n,
              recipient: address,
            },
          ],
          counter: 1n,
          orderType: 1,
          startTime: 1n,
          endTime: 1n,
          salt: 1n,
          conduitKey: address,
          zoneHash: address,
        },
      ],
    ],
  })
})

const args = {
  ...wagmiContractConfig,
  functionName: 'mint',
  args: [69420n],
} as const

test('infers args', () => {
  writeContract(walletClientWithAccount, {
    ...wagmiContractConfig,
    functionName: 'transferFrom',
    args: ['0x', '0x', 123n],
  })
})

test('legacy', () => {
  writeContract(walletClientWithAccount, {
    ...args,
    gasPrice: 0n,
  })

  // @ts-expect-error
  writeContract(walletClientWithAccount, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  writeContract(walletClientWithAccount, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  })
  // @ts-expect-error
  writeContract(walletClientWithAccount, {
    ...args,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  })
})

test('eip1559', () => {
  writeContract(walletClientWithAccount, {
    ...args,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  writeContract(walletClientWithAccount, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  writeContract(walletClientWithAccount, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip1559',
  })
  // @ts-expect-error
  writeContract(walletClientWithAccount, {
    ...args,
    gasPrice: 0n,
    type: 'eip1559',
  })
})

test('eip2930', () => {
  writeContract(walletClientWithAccount, {
    ...args,
    accessList: [],
    gasPrice: 0n,
  })

  // @ts-expect-error
  writeContract(walletClientWithAccount, {
    ...args,
    accessList: [],
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  writeContract(walletClientWithAccount, {
    ...args,
    accessList: [],
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  })
  // @ts-expect-error
  writeContract(walletClientWithAccount, {
    ...args,
    accessList: [],
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  })
})
