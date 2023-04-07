import { bench, describe } from 'vitest'
import { utils as ethersV5Utils } from 'ethers'
import { Transaction } from 'ethers@6'
import { parseTransaction } from './parseTransaction.js'
import { parseEther } from '../unit/index.js'
import { accounts } from '../../_test/index.js'
import type { TransactionSerializableBase } from '../../types/index.js'
import { serializeTransaction } from './serializeTransaction.js'

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
    ethersV5Utils.parseTransaction(legacy)
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
    ethersV5Utils.parseTransaction(eip1559)
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
    ethersV5Utils.parseTransaction(eip2930)
  })

  bench('ethers@6: `Transaction.from`', () => {
    Transaction.from(eip2930)
  })
})
