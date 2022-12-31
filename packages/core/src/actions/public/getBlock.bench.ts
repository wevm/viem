import { bench, describe } from 'vitest'

import { ethersProvider, publicClient, web3Provider } from '../../../test'

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
})
