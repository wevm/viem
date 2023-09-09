import { JsonRpcSigner } from 'ethers@6'

import { bench, describe } from 'vitest'

import { ethersProvider, ethersV6Provider } from '~test/src/bench.js'
import { accounts } from '~test/src/constants.js'
import { walletClient } from '~test/src/utils.js'
import { parseEther } from '../../utils/unit/parseEther.js'

import { sendTransaction } from './sendTransaction.js'

describe('Send Transaction', () => {
  bench('viem: `sendTransaction`', async () => {
    await sendTransaction(walletClient, {
      account: accounts[0].address,
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
