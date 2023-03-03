import { bench, describe } from 'vitest'

import { ethersProvider, ethersV6Provider, publicClient } from '../../_test'

import { getBlock } from './getBlock'

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
