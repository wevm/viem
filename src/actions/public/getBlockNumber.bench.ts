import { bench, describe } from 'vitest'
import { anvilMainnet } from '~test/anvil.js'
import { ethersProvider } from '~test/bench.js'

import { getBlockNumber } from './getBlockNumber.js'

const client = anvilMainnet.getClient()

describe('Get Block Number', () => {
  bench('viem: `getBlockNumber`', async () => {
    await getBlockNumber(client)
  })

  bench('ethers: `getBlockNumber`', async () => {
    await ethersProvider.getBlockNumber()
  })
})
