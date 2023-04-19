import { bench, describe } from 'vitest'

import {
  ethersProvider,
  ethersV6Provider,
  publicClient,
  setupAnvil,
} from '../../_test/index.js'

import { getBlock } from './getBlock.js'

setupAnvil()

describe('Get Block', () => {
  bench('viem: `getBlock`', async () => {
    await getBlock(publicClient)
  })

  bench('ethers@5: `getBlock`', async () => {
    await ethersProvider.getBlock('latest')
  })

  bench('ethers@6: `getBlock`', async () => {
    await ethersV6Provider.getBlock('latest')
  })
})
