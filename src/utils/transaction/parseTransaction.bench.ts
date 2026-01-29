import { Transaction } from 'ethers'

import { bench, describe } from 'vitest'

import { accounts } from '~test/src/constants.js'
import type { TransactionSerializableBase } from '../../types/transaction.js'
import { parseEther } from '../unit/parseEther.js'

import { parseTransaction } from './parseTransaction.js'
import { serializeTransaction } from './serializeTransaction.js'

const base = {
  to: accounts[1].address,
  nonce: 785,
  value: parseEther('1'),
} satisfies TransactionSerializableBase

const legacy = serializeTransaction(
  { ...base, gasPrice: 1n },
  { r: '0x1', s: '0x2', yParity: 1 },
)
const eip1559 = serializeTransaction(
  { ...base, chainId: 1, maxFeePerGas: 1n },
  { r: '0x1', s: '0x2', yParity: 1 },
)
const eip2930 = serializeTransaction(
  { ...base, chainId: 1, gasPrice: 1n, accessList: [] },
  { r: '0x1', s: '0x2', yParity: 1 },
)

describe('Parse Transaction (Legacy)', () => {
  bench('viem: `parseTransaction`', () => {
    parseTransaction(legacy)
  })

  bench('ethers: `Transaction.from`', () => {
    Transaction.from(legacy)
  })
})

describe('Parse Transaction (EIP1559)', () => {
  bench('viem: `parseTransaction`', () => {
    parseTransaction(eip1559)
  })

  bench('ethers: `Transaction.from`', () => {
    Transaction.from(eip1559)
  })
})

describe('Parse Transaction (EIP2930)', () => {
  bench('viem: `parseTransaction`', () => {
    parseTransaction(eip2930)
  })

  bench('ethers: `Transaction.from`', () => {
    Transaction.from(eip2930)
  })
})
