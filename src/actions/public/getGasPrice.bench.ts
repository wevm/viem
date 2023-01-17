import { bench, describe } from 'vitest'

import {
  essentialProvider,
  ethersProvider,
  publicClient,
  web3Provider,
} from '../../../test'

import { getGasPrice } from './getGasPrice'

describe('Get Gas Price', () => {
  bench('viem: `getGasPrice`', async () => {
    await getGasPrice(publicClient)
  })

  bench('ethers: `getGasPrice`', async () => {
    await ethersProvider.getGasPrice()
  })

  bench('web3.js: `getGasPrice`', async () => {
    await web3Provider.eth.getGasPrice()
  })

  bench('essential-eth: `getGasPrice`', async () => {
    await essentialProvider.getGasPrice()
  })
})
