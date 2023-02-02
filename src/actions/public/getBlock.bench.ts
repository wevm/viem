import { bench, describe } from 'vitest'

import {
  essentialProvider,
  ethersProvider,
  publicClient,
  web3Provider,
} from '../../_test'

import { getBlock } from './getBlock'

describe('Get Block', () => {
  bench('viem: `getBlock`', async () => {
    await getBlock(publicClient)
  })

  bench('ethers: `getBlock`', async () => {
    await ethersProvider.getBlock('latest')
  })

  bench('web3.js: `getBlock`', async () => {
    await web3Provider.eth.getBlock('latest')
  })

  bench('essential-eth: `getBlock`', async () => {
    await essentialProvider.getBlock('latest')
  })
})
