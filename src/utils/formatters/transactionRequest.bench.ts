import { providers } from 'ethers'
import { bench, describe } from 'vitest'

import type { TransactionRequest } from '../../types/index.js'

import { formatTransactionRequest } from './transactionRequest.js'

const receipt: TransactionRequest = {
  data: '0x0000000000000000000000000000000000000000000000000000002b3b6fb3d0',
  from: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  gas: 69420420n,
  nonce: 1,
  to: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  value: 1n,
  maxFeePerGas: 69n,
  maxPriorityFeePerGas: 69n,
}

const formatter = new providers.Formatter()

describe.skip('Format Transaction Request', () => {
  bench('viem: `formatTransactionReceipt`', () => {
    formatTransactionRequest(receipt)
  })

  bench('ethers: `formatter.transactionRequest`', () => {
    formatter.transactionRequest(receipt)
  })
})
