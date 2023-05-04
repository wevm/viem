import { ethersProvider, ethersV6Provider } from '../../_test/bench.js'
import { publicClient } from '../../_test/utils.js'
import { getTransaction } from './getTransaction.js'
import { bench, describe } from 'vitest'

const hash =
  '0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98b'

describe('Get Transaction', () => {
  bench('viem: `getTransaction`', async () => {
    await getTransaction(publicClient, {
      hash,
    })
  })

  bench('ethers@5: `getTransaction`', async () => {
    await ethersProvider.getTransaction(hash)
  })

  bench('ethers@6: `getTransaction`', async () => {
    await ethersV6Provider.getTransaction(hash)
  })
})
