import { bench, describe } from 'vitest'

import { ethersProvider, publicClient } from '../../../test'

import { getGasPrice } from './getGasPrice'

describe('Get Gas Price', () => {
  bench('viem: `getGasPrice`', async () => {
    await getGasPrice(publicClient)
  })

  bench('ethers: `getGasPrice`', async () => {
    await ethersProvider.getGasPrice()
  })
})
