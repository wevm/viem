import { ethersProvider } from '../../_test/bench.js'
import { publicClient } from '../../_test/utils.js'
import { getGasPrice } from './getGasPrice.js'
import { bench, describe } from 'vitest'

describe('Get Gas Price', () => {
  bench('viem: `getGasPrice`', async () => {
    await getGasPrice(publicClient)
  })

  bench('ethers@5: `getGasPrice`', async () => {
    await ethersProvider.getGasPrice()
  })
})
