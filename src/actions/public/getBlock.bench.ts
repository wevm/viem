import { bench, describe } from 'vitest'
import { anvilMainnet } from '~test/anvil.js'
import { ethersProvider } from '~test/bench.js'

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
