import { bench, describe } from 'vitest'

import { ethersProvider } from '~test/src/bench.js'
import { publicClient } from '~test/src/utils.js'

import { getBlock } from './getBlock.js'

describe('Get Block', () => {
  bench('viem: `getBlock`', async () => {
    await getBlock(publicClient)
  })

  bench('ethers: `getBlock`', async () => {
    await ethersProvider.getBlock('latest')
  })
})
