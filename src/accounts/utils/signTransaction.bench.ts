import { Wallet } from 'ethers'

import { bench, describe } from 'vitest'

import { accounts } from '~test/src/constants.js'
import type { TransactionSerializableBase } from '../../types/transaction.js'
import { parseEther } from '../../utils/unit/parseEther.js'

import { signTransaction } from './signTransaction.js'

const base = {
  to: accounts[1].address,
  nonce: 785,
  value: parseEther('1'),
} satisfies TransactionSerializableBase

const wallet = new Wallet(accounts[0].privateKey)

describe('Sign Transaction (Legacy)', () => {
  bench('viem: `serializeTransaction`', async () => {
    await signTransaction({
      transaction: { ...base, gasPrice: 1n },
      privateKey: accounts[0].privateKey,
    })
  })

  bench('ethers: `Wallet.signTransaction`', async () => {
    await wallet.signTransaction({ ...base, gasPrice: 1n, type: 0 })
  })
})

describe('Sign Transaction (EIP1559)', () => {
  bench('viem: `signTransaction`', async () => {
    await signTransaction({
      transaction: { ...base, chainId: 1, maxFeePerGas: 1n },
      privateKey: accounts[0].privateKey,
    })
  })

  bench('ethers: `Wallet.signTransaction`', async () => {
    await wallet.signTransaction({
      ...base,
      chainId: 1,
      maxFeePerGas: 1n,
      type: 2,
    })
  })
})

describe('Sign Transaction (EIP2930)', () => {
  bench('viem: `signTransaction`', async () => {
    await signTransaction({
      transaction: { ...base, chainId: 1, gasPrice: 1n, accessList: [] },
      privateKey: accounts[0].privateKey,
    })
  })

  bench('ethers: `Wallet.signTransaction`', async () => {
    await wallet.signTransaction({
      ...base,
      chainId: 1,
      maxFeePerGas: 1n,
      type: 2,
    })
  })
})
