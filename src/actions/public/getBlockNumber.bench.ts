import { bench, describe } from 'vitest'

import {
  essentialProvider,
  ethersProvider,
  publicClient,
  web3Provider,
} from '../../../test'

import { getBlockNumber } from './getBlockNumber'

describe('Get Block Number', () => {
  bench('viem: `getBlockNumber`', async () => {
    await getBlockNumber(publicClient)
  })

  bench('ethers: `getBlockNumber`', async () => {
    await ethersProvider.getBlockNumber()
  })

  bench('web3.js: `getBlockNumber`', async () => {
    await web3Provider.eth.getBlockNumber()
  })

  bench('essential-eth: `getBlockNumber`', async () => {
    await essentialProvider.getBlockNumber()
  })
})
