import { bench, describe } from 'vitest'
import { accounts } from '../../_test/index.js'
import type { TransactionSerializableBase } from '../../types/index.js'
import { parseEther } from '../../utils/index.js'
import { signTransaction } from './signTransaction.js'
import { Wallet } from 'ethers'
import { Wallet as WalletV6 } from 'ethers@6'

const base = {
  to: accounts[1].address,
  nonce: 785,
  value: parseEther('1'),
} satisfies TransactionSerializableBase

const wallet = new Wallet(accounts[0].privateKey)
const walletV6 = new WalletV6(accounts[0].privateKey)

describe('Sign Transaction (Legacy)', () => {
  bench('viem: `serializeTransaction`', async () => {
    await signTransaction({
      transaction: { ...base, gasPrice: 1n },
      privateKey: accounts[0].privateKey,
    })
  })

  bench('ethers@5: `Wallet.signTransaction`', async () => {
    await wallet.signTransaction({ ...base, gasPrice: 1n, type: 0 })
  })

  bench('ethers@6: `Wallet.signTransaction`', async () => {
    await walletV6.signTransaction({ ...base, gasPrice: 1n, type: 0 })
  })
})

describe('Sign Transaction (EIP1559)', () => {
  bench('viem: `signTransaction`', async () => {
    await signTransaction({
      transaction: { ...base, chainId: 1, maxFeePerGas: 1n },
      privateKey: accounts[0].privateKey,
    })
  })

  bench('ethers@5: `Wallet.signTransaction`', async () => {
    await wallet.signTransaction({
      ...base,
      chainId: 1,
      maxFeePerGas: 1n,
      type: 2,
    })
  })

  bench('ethers@6: `Wallet.signTransaction`', async () => {
    await walletV6.signTransaction({
      ...base,
      chainId: 1,
      maxFeePerGas: 1n,
      type: 2,
    })
  })
})

describe('Sign Transaction (EIP2930)', () => {
  bench('viem: `signTransactiion`', async () => {
    await signTransaction({
      transaction: { ...base, chainId: 1, gasPrice: 1n, accessList: [] },
      privateKey: accounts[0].privateKey,
    })
  })

  bench('ethers@5: `Wallet.signTransactiion`', async () => {
    await wallet.signTransaction({
      ...base,
      chainId: 1,
      maxFeePerGas: 1n,
      type: 2,
    })
  })

  bench('ethers@6: `Wallet.signTransactiion`', async () => {
    await wallet.signTransaction({
      ...base,
      chainId: 1,
      maxFeePerGas: 1n,
      type: 2,
    })
  })
})
