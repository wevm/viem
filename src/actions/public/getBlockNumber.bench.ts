import { ethersProvider, ethersV6Provider } from '../../_test/bench.js'
import { publicClient } from '../../_test/utils.js'
import { getBlockNumber } from './getBlockNumber.js'
import { bench, describe } from 'vitest'

describe('Get Block Number', () => {
  bench('viem: `getBlockNumber`', async () => {
    await getBlockNumber(publicClient)
  })

  bench('ethers@5: `getBlockNumber`', async () => {
    await ethersProvider.getBlockNumber()
  })

  bench('ethers@6: `getBlockNumber`', async () => {
    await ethersV6Provider.getBlockNumber()
  })
})
