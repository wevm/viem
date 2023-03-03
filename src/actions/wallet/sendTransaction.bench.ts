import { bench, describe } from 'vitest'

import {
  accounts,
  ethersProvider,
  ethersV6Provider,
  walletClient,
} from '../../_test'
import { getAccount, parseEther } from '../../utils'

import { sendTransaction } from './sendTransaction'
import { JsonRpcSigner } from 'ethers@6'

describe('Send Transaction', () => {
  bench('viem: `sendTransaction`', async () => {
    await sendTransaction(walletClient, {
      account: getAccount(accounts[0].address),
      to: accounts[1].address,
      value: parseEther('1'),
    })
  })

  bench('ethers@5: `sendTransaction`', async () => {
    await ethersProvider.getSigner(accounts[1].address).sendTransaction({
      to: accounts[1].address,
      value: parseEther('1'),
    })
  })

  bench('ethers@6: `sendTransaction`', async () => {
    const signer = new JsonRpcSigner(ethersV6Provider, accounts[2].address)
    await signer.sendTransaction({
      to: accounts[1].address,
      value: parseEther('1'),
    })
  })
})
