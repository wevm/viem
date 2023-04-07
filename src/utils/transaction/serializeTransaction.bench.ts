import { bench, describe } from 'vitest'
import { utils as ethersV5Utils } from 'ethers'
import { Transaction } from 'ethers@6'
import { serializeTransaction } from './serializeTransaction.js'
import { parseEther } from '../unit/index.js'
import { accounts } from '../../_test/index.js'
import type { TransactionSerializableBase } from '../../types/index.js'

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

  bench('ethers@5: `serializeTransaction`', () => {
    ethersV5Utils.serializeTransaction(
      { ...base, gasPrice: 1n, type: 0 },
      { r: '0x1', s: '0x2', v: 28 },
    )
  })

  bench('ethers@6: `Transaction.serialized`', () => {
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

  bench('ethers@5: `serializeTransaction`', () => {
    ethersV5Utils.serializeTransaction(
      { ...base, chainId: 1, maxFeePerGas: 1n, type: 2 },
      { r: '0x1', s: '0x2', v: 28 },
    )
  })

  bench('ethers@6: `Transaction.serialized`', () => {
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

  bench('ethers@5: `serializeTransaction`', () => {
    ethersV5Utils.serializeTransaction(
      { ...base, chainId: 1, gasPrice: 1n, accessList: [], type: 1 },
      { r: '0x1', s: '0x2', v: 28 },
    )
  })

  bench('ethers@6: `Transaction.serialized`', () => {
    Transaction.from({
      ...base,
      chainId: 1,
      gasPrice: 1n,
      accessList: [],
      signature: { r: '0x1', s: '0x2', v: 28 },
    }).serialized
  })
})
