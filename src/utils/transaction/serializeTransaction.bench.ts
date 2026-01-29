import { Transaction } from 'ethers'

import { bench, describe } from 'vitest'

import { accounts } from '~test/src/constants.js'
import type { TransactionSerializableBase } from '../../types/transaction.js'
import { parseEther } from '../unit/parseEther.js'

import { serializeTransaction } from './serializeTransaction.js'

const base = {
  to: accounts[1].address,
  nonce: 785,
  value: parseEther('1'),
} satisfies TransactionSerializableBase

describe('Serialize Transaction (Legacy)', () => {
  bench('viem: `serializeTransaction`', () => {
    serializeTransaction(
      { ...base, gasPrice: 1n },
      { r: '0x1', s: '0x2', v: 28n },
    )
  })

  bench('ethers: `Transaction.serialized`', () => {
    Transaction.from({
      ...base,
      gasPrice: 1n,
      type: 0,
      signature: { r: '0x1', s: '0x2', v: 28 },
    }).serialized
  })
})

describe('Serialize Transaction (EIP1559)', () => {
  bench('viem: `serializeTransaction`', () => {
    serializeTransaction(
      { ...base, chainId: 1, maxFeePerGas: 1n },
      { r: '0x1', s: '0x2', v: 28n },
    )
  })

  bench('ethers: `Transaction.serialized`', () => {
    Transaction.from({
      ...base,
      chainId: 1,
      maxFeePerGas: 1n,
      type: 2,
      signature: { r: '0x1', s: '0x2', v: 28 },
    }).serialized
  })
})

describe('Serialize Transaction (EIP2930)', () => {
  bench('viem: `serializeTransaction`', () => {
    serializeTransaction(
      { ...base, chainId: 1, gasPrice: 1n, accessList: [] },
      { r: '0x1', s: '0x2', v: 28n },
    )
  })

  bench('ethers: `Transaction.serialized`', () => {
    Transaction.from({
      ...base,
      chainId: 1,
      gasPrice: 1n,
      accessList: [],
      signature: { r: '0x1', s: '0x2', v: 28 },
    }).serialized
  })
})
