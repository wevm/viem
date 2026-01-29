import { bench, describe } from 'vitest'

import { ethersProvider } from '~test/src/bench.js'

import { anvilMainnet } from '../../../test/src/anvil.js'

import { getBlock } from './getBlock.js'

const client = anvilMainnet.getClient()

describe('Get Block', () => {
  bench('viem: `getBlock`', async () => {
    await getBlock(client)
  })

  bench('ethers: `getBlock`', async () => {
    await ethersProvider.getBlock('latest')
  })
})
