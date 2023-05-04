import { accounts } from '../_test/constants.js'
import { typedData } from '../_test/constants.js'
import { parseEther } from '../utils/unit/parseEther.js'
import { parseGwei } from '../utils/unit/parseGwei.js'
import { ethersWalletToAccount } from './ethers.js'
import { Wallet } from 'ethers'
import { expect, test } from 'vitest'

const wallet = new Wallet(accounts[0].privateKey)

test('ethersWalletToAccount', async () => {
  const account = ethersWalletToAccount(wallet)
  expect(account).toBeDefined()
})

test('sign message', async () => {
  const account = ethersWalletToAccount(wallet)
  expect(
    await account.signMessage({ message: 'hello world' }),
  ).toMatchInlineSnapshot(
    '"0xa461f509887bd19e312c0c58467ce8ff8e300d3c1a90b608a760c5b80318eaf15fe57c96f9175d6cd4daad4663763baa7e78836e067d0163e9a2ccf2ff753f5b1b"',
  )
})

test('sign transaction', async () => {
  const account = ethersWalletToAccount(wallet)
  expect(
    await account.signTransaction({
      chainId: 1,
      maxFeePerGas: parseGwei('20'),
      gas: 21000n,
      to: accounts[1].address,
      value: parseEther('1'),
    }),
  ).toMatchInlineSnapshot(
    '"0xf86780808252089470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a76400008026a03ec626b62cae2fd8501eeec0834f32905fe427e5662d74c54aee6327c095f575a061a2ba689d44aef7da3355126a1685cbeeb19b199d7c81ed1239a8ad649e880a"',
  )

  // with types for coverage
  await account.signTransaction({ type: 'legacy' })
  await account.signTransaction({ type: 'eip1559', chainId: 1 })
  await account.signTransaction({ type: 'eip2930', chainId: 1 })

  // with conditional properties for coverage
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
  expect(
    await account.signTypedData({ ...typedData.basic, primaryType: 'Mail' }),
  ).toMatchInlineSnapshot(
    '"0x32f3d5975ba38d6c2fba9b95d5cbed1febaa68003d3d588d51f2de522ad54117760cfc249470a75232552e43991f53953a3d74edf6944553c6bef2469bb9e5921b"',
  )

  // without domain for coverage
  await account.signTypedData({
    ...typedData.basic,
    domain: undefined,
    primaryType: 'Mail',
  })
})
