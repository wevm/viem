import { bench, describe } from 'vitest'

import { ethersProvider, publicClient } from '../../../test'

import { getBlockNumber } from './getBlockNumber'

describe('Get Block Number', () => {
  bench('viem: `getBlockNumber`', async () => {
    await getBlockNumber(publicClient)
  })

  bench('ethers: `getBlockNumber`', async () => {
    await ethersProvider.getBlockNumber()
  })
})
