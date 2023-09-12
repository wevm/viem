import { bench, describe } from 'vitest'

import { ethersProvider } from '~test/src/bench.js'
import { publicClient } from '~test/src/utils.js'

import { getTransactionReceipt } from './getTransactionReceipt.js'

const hash =
  '0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98b'

describe('Get Transaction Receipt', () => {
  bench('viem: `getTransactionReceipt`', async () => {
    await getTransactionReceipt(publicClient, {
      hash,
    })
  })

  bench('ethers: `getTransactionReceipt`', async () => {
    await ethersProvider.getTransactionReceipt(hash)
  })
})
