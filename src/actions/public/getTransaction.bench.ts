import { bench, describe } from 'vitest'

import { ethersProvider } from '~test/src/bench.js'

import { anvilMainnet } from '../../../test/src/anvil.js'

import { getTransaction } from './getTransaction.js'

const client = anvilMainnet.getClient()

const hash =
  '0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98b'

describe('Get Transaction', () => {
  bench('viem: `getTransaction`', async () => {
    await getTransaction(client, {
      hash,
    })
  })
  bench('ethers: `getTransaction`', async () => {
    await ethersProvider.getTransaction(hash)
  })
})
