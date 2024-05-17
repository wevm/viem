import { JsonRpcSigner } from 'ethers'

import { bench, describe } from 'vitest'

import { ethersProvider } from '~test/src/bench.js'
import { accounts } from '~test/src/constants.js'
import { parseEther } from '../../utils/unit/parseEther.js'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { sendTransaction } from './sendTransaction.js'

const client = anvilMainnet.getClient()

describe('Send Transaction', () => {
  bench('viem: `sendTransaction`', async () => {
    await sendTransaction(client, {
      account: accounts[0].address,
      to: accounts[1].address,
      value: parseEther('1'),
    })
  })

  bench('ethers: `sendTransaction`', async () => {
    const signer = new JsonRpcSigner(ethersProvider, accounts[2].address)
    await signer.sendTransaction({
      to: accounts[1].address,
      value: parseEther('1'),
    })
  })
})
