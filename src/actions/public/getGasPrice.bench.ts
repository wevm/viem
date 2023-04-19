import { bench, describe } from 'vitest'

import { ethersProvider, publicClient, setupAnvil } from '../../_test/index.js'

import { getGasPrice } from './getGasPrice.js'

setupAnvil()

describe('Get Gas Price', () => {
  bench('viem: `getGasPrice`', async () => {
    await getGasPrice(publicClient)
  })

  bench('ethers@5: `getGasPrice`', async () => {
    await ethersProvider.getGasPrice()
  })
})
