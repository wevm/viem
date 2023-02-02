import { beforeAll, bench, describe } from 'vitest'

import {
  accounts,
  ethersProvider,
  publicClient,
  walletClient,
  web3Provider,
} from '../../_test'
import { parseEther } from '../../utils'
import { getTransactionCount } from '../public'

import { sendTransaction } from './sendTransaction'

let nonce: number

beforeAll(async () => {
  nonce = await getTransactionCount(publicClient, {
    address: accounts[0].address,
  })
})

describe('Send Transaction', () => {
  bench('viem: `sendTransaction`', async () => {
    await sendTransaction(walletClient, {
      from: accounts[0].address,
      to: accounts[1].address,
      value: parseEther('1'),
      nonce: nonce++,
    })
  })

  bench('ethers: `sendTransaction`', async () => {
    await ethersProvider.getSigner(accounts[0].address).sendTransaction({
      to: accounts[1].address,
      value: parseEther('1'),
      nonce: nonce++,
    })
  })

  bench(
    'web3.js: `sendTransaction`',
    async () => {
      await new Promise((resolve) => {
        web3Provider.eth
          .sendTransaction({
            from: accounts[0].address,
            to: accounts[1].address,
            value: '1000000000000000',
            nonce: nonce++,
          })
          .on('transactionHash', resolve)
      })
    },
    { iterations: 10 },
  )
})
