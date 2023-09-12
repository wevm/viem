import { test } from 'vitest'

import { wagmiContractConfig } from '~test/src/abis.js'
import { accounts } from '~test/src/constants.js'
import {
  publicClient,
  walletClient,
  walletClientWithAccount,
} from '~test/src/utils.js'
import { estimateContractGas } from './estimateContractGas.js'

const args = {
  ...wagmiContractConfig,
  functionName: 'mint',
  args: [69420n],
} as const

test('publicClient', () => {
  estimateContractGas(publicClient, {
    ...args,
    account: accounts[0].address,
  })
})

test('wallet client without account', () => {
  estimateContractGas(walletClient, {
    ...args,
    account: accounts[0].address,
  })
})

test('wallet client with account', () => {
  estimateContractGas(walletClientWithAccount, {
    ...args,
  })
})

test('legacy', () => {
  estimateContractGas(walletClientWithAccount, {
    ...args,
    gasPrice: 0n,
  })

  // @ts-expect-error
  estimateContractGas(walletClientWithAccount, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  estimateContractGas(walletClientWithAccount, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  })
  // @ts-expect-error
  estimateContractGas(walletClientWithAccount, {
    ...args,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  })
})

test('eip1559', () => {
  estimateContractGas(walletClientWithAccount, {
    ...args,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  estimateContractGas(walletClientWithAccount, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  estimateContractGas(walletClientWithAccount, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip1559',
  })
  // @ts-expect-error
  estimateContractGas(walletClientWithAccount, {
    ...args,
    gasPrice: 0n,
    type: 'eip1559',
  })
})

test('eip2930', () => {
  estimateContractGas(walletClientWithAccount, {
    ...args,
    accessList: [],
    gasPrice: 0n,
  })

  // @ts-expect-error
  estimateContractGas(walletClientWithAccount, {
    ...args,
    accessList: [],
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  estimateContractGas(walletClientWithAccount, {
    ...args,
    accessList: [],
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  })
  // @ts-expect-error
  estimateContractGas(walletClientWithAccount, {
    ...args,
    accessList: [],
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  })
})
