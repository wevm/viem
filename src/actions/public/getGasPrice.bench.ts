import { bench, describe } from 'vitest'

import { ethersProvider, publicClient } from '../../_test/index.js'

import { getGasPrice } from './getGasPrice.js'

describe('Get Gas Price', () => {
  bench('viem: `getGasPrice`', async () => {
    await getGasPrice(publicClient)
  })

  bench('ethers@5: `getGasPrice`', async () => {
    await ethersProvider.getGasPrice()
  })
})
