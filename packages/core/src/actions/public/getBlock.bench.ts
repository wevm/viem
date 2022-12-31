import { bench, describe } from 'vitest'

import { ethersProvider, publicClient } from '../../../test'

import { getBlock } from './getBlock'

describe('Get Block', () => {
  bench('viem: `getBlock`', async () => {
    await getBlock(publicClient)
  })

  bench('ethers: `getBlock`', async () => {
    await ethersProvider.getBlock('latest')
  })
})
