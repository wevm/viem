import { bench, describe } from 'vitest'

import { ethersProvider } from '~test/src/bench.js'
import { publicClient } from '~test/src/utils.js'

import { getBlockNumber } from './getBlockNumber.js'

describe('Get Block Number', () => {
  bench('viem: `getBlockNumber`', async () => {
    await getBlockNumber(publicClient)
  })

  bench('ethers: `getBlockNumber`', async () => {
    await ethersProvider.getBlockNumber()
  })
})
