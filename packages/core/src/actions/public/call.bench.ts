import { bench, describe } from 'vitest'

import {
  accounts,
  ethersProvider,
  publicClient,
  web3Provider,
} from '../../../test'

import { call } from './call'

const wagmiContractAddress = '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2'
const name4bytes = '0x06fdde03'

describe('Call', () => {
  bench('viem: `call`', async () => {
    await call(publicClient, {
      request: {
        data: name4bytes,
        from: accounts[0].address,
        to: wagmiContractAddress,
      },
    })
  })

  bench('ethers: `call`', async () => {
    await ethersProvider.call({
      data: name4bytes,
      from: accounts[0].address,
      to: wagmiContractAddress,
    })
  })

  bench('web3.js: `call`', async () => {
    await web3Provider.eth.call({
      data: name4bytes,
      from: accounts[0].address,
      to: wagmiContractAddress,
    })
  })
})
