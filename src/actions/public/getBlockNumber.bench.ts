import { bench, describe } from 'vitest'

import { ethersProvider } from '~test/src/bench.js'

import { anvilMainnet } from '../../../test/src/anvil.js'

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
