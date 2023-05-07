import { bench, describe } from 'vitest'

import { ethersProvider, ethersV6Provider } from '../../_test/bench.js'
import { publicClient } from '../../_test/utils.js'

import { getBlock } from './getBlock.js'

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
