import { bench, describe } from 'vitest'

import { ethersProvider, publicClient } from '../../_test'

import { getGasPrice } from './getGasPrice'

describe('Get Gas Price', () => {
  bench('viem: `getGasPrice`', async () => {
    await getGasPrice(publicClient)
  })

  bench('ethers@5: `getGasPrice`', async () => {
    await ethersProvider.getGasPrice()
  })
})
