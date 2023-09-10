import { seaportAbi } from 'abitype/test'
import { assertType, expectTypeOf, test } from 'vitest'

import { baycContractConfig, wagmiContractConfig } from '~test/src/abis.js'
import { walletClientWithAccount } from '~test/src/utils.js'
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

test('args: value', () => {
  // payable function
  writeContract(walletClientWithAccount, {
    abi: baycContractConfig.abi,
    address: '0x',
    functionName: 'mintApe',
    args: [69n],
    value: 5n,
  })

  // payable function (undefined)
  writeContract(walletClientWithAccount, {
    abi: baycContractConfig.abi,
    address: '0x',
    functionName: 'mintApe',
    args: [69n],
  })

  // nonpayable function
  writeContract(walletClientWithAccount, {
    abi: baycContractConfig.abi,
    address: '0x',
    functionName: 'approve',
    // @ts-expect-error
    value: 5n,
  })
})
