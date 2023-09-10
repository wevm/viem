import { test } from 'vitest'

import { wagmiContractConfig } from '~test/src/abis.js'
import { walletClient } from '~test/src/utils.js'

import { deployContract } from './deployContract.js'

const args = {
  ...wagmiContractConfig,
  account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  bytecode: '0x',
} as const

test('legacy', () => {
  deployContract(walletClient, {
    ...args,
    gasPrice: 0n,
  })

  // @ts-expect-error
  deployContract(walletClient, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  deployContract(walletClient, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  })
  // @ts-expect-error
  deployContract(walletClient, {
    ...args,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  })
})

test('eip1559', () => {
  deployContract(walletClient, {
    ...args,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  deployContract(walletClient, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  deployContract(walletClient, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip1559',
  })
  // @ts-expect-error
  deployContract(walletClient, {
    ...args,
    gasPrice: 0n,
    type: 'eip1559',
  })
})

test('eip2930', () => {
  deployContract(walletClient, {
    ...args,
    gasPrice: 0n,
  })

  // @ts-expect-error
  deployContract(walletClient, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  deployContract(walletClient, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  })
  // @ts-expect-error
  deployContract(walletClient, {
    ...args,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  })
})
