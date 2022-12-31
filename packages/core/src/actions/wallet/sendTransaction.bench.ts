import { beforeAll, bench, describe } from 'vitest'

import {
  accounts,
  ethersProvider,
  publicClient,
  walletClient,
} from '../../../test'
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
      request: {
        from: accounts[0].address,
        to: accounts[1].address,
        value: parseEther('1'),
        nonce: nonce++,
      },
    })
  })

  bench('ethers: `sendTransaction`', async () => {
    await ethersProvider.getSigner(accounts[0].address).sendTransaction({
      to: accounts[1].address,
      value: parseEther('1'),
      nonce: nonce++,
    })
  })
})
