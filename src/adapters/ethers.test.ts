import { Wallet } from 'ethers'
import { test } from 'vitest'
import { accounts } from '../_test'
import { ethersWalletToAccount } from './ethers'

test('ethersWalletToAccount', async () => {
  const wallet = new Wallet(accounts[0].privateKey)
  const account = ethersWalletToAccount(wallet)
  await account.signTransaction({ type: 'legacy' })
  await account.signTransaction({ type: 'eip1559', chainId: 1 })
  await account.signTransaction({ type: 'eip2930', chainId: 1 })
})
