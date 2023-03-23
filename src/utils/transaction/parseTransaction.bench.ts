import { bench, describe } from 'vitest'
import { parseTransaction as parseTransactionEthers } from 'ethers/lib/utils'
import { Transaction } from 'ethers@6'
import { parseTransaction } from './parseTransaction'
import { parseEther } from '../unit'
import { accounts } from '../../_test'
import type { TransactionSerializableBase } from '../../types'
import { serializeTransaction } from './serializeTransaction'

const base = {
  to: accounts[1].address,
  nonce: 785,
  value: parseEther('1'),
} satisfies TransactionSerializableBase

const legacy = serializeTransaction(
  { ...base, gasPrice: 1n },
  { r: '0x1', s: '0x2', v: 28n },
)
const eip1559 = serializeTransaction(
  { ...base, chainId: 1, maxFeePerGas: 1n },
  { r: '0x1', s: '0x2', v: 28n },
)
const eip2930 = serializeTransaction(
  { ...base, chainId: 1, gasPrice: 1n, accessList: [] },
  { r: '0x1', s: '0x2', v: 28n },
)

describe('Parse Transaction (Legacy)', () => {
  bench('viem: `parseTransaction`', () => {
    parseTransaction(legacy)
  })

  bench('ethers@5: `parseTransaction`', () => {
    parseTransactionEthers(legacy)
  })

  bench('ethers@6: `Transaction.from`', () => {
    Transaction.from(legacy)
  })
})

describe('Parse Transaction (EIP1559)', () => {
  bench('viem: `parseTransaction`', () => {
    parseTransaction(eip1559)
  })

  bench('ethers@5: `parseTransaction`', () => {
    parseTransactionEthers(eip1559)
  })

  bench('ethers@6: `Transaction.from`', () => {
    Transaction.from(eip1559)
  })
})

describe('Parse Transaction (EIP2930)', () => {
  bench('viem: `parseTransaction`', () => {
    parseTransaction(eip2930)
  })

  bench('ethers@5: `parseTransaction`', () => {
    parseTransactionEthers(eip2930)
  })

  bench('ethers@6: `Transaction.from`', () => {
    Transaction.from(eip2930)
  })
})
