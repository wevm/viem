import { Wallet } from 'ethers'
import { expect, test } from 'vitest'
import { accounts, typedData } from '../_test/index.js'
import { ethersWalletToAccount } from './ethers.js'
const wallet = new Wallet(accounts[0].privateKey)

test('ethersWalletToAccount', async () => {
  const account = ethersWalletToAccount(wallet)
  expect(account).toBeDefined()
})

test('signMessage', async () => {
  const account = ethersWalletToAccount(wallet)
  await account.signMessage({ message: 'foo bar baz' })
})

test('signTransaction', async () => {
  const account = ethersWalletToAccount(wallet)
  // with types
  await account.signTransaction({ type: 'legacy' })
  await account.signTransaction({ type: 'eip1559', chainId: 1 })
  await account.signTransaction({ type: 'eip2930', chainId: 1 })

  // with conditional properties
  await account.signTransaction({ type: 'eip1559', chainId: 1, accessList: [] })
  await account.signTransaction({
    type: 'eip1559',
    chainId: 1,
    maxPriorityFeePerGas: 100n,
    maxFeePerGas: 100n,
  })
})

test('signTypedData', async () => {
  const account = ethersWalletToAccount(wallet)
  await account.signTypedData({
    ...typedData.basic,
    primaryType: 'Mail',
  })
})
