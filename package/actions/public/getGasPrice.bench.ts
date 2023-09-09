import { bench, describe } from 'vitest'

import { ethersProvider } from '~test/src/bench.js'
import { publicClient } from '~test/src/utils.js'

import { getGasPrice } from './getGasPrice.js'

describe('Get Gas Price', () => {
  bench('viem: `getGasPrice`', async () => {
    await getGasPrice(publicClient)
  })

  bench('ethers@5: `getGasPrice`', async () => {
    await ethersProvider.getGasPrice()
  })
})
