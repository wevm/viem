import { test } from 'vitest'

import { wagmiContractConfig } from '~test/src/abis.js'
import { publicClient } from '~test/src/utils.js'

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
