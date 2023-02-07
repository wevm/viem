import { bench, describe } from 'vitest'

import {
  ethersProvider,
  ethersV6Provider,
  publicClient,
  web3Provider,
} from '../../_test'

import { getBlockNumber } from './getBlockNumber'

describe('Get Block Number', () => {
  bench('viem: `getBlockNumber`', async () => {
    await getBlockNumber(publicClient)
  })

  bench('ethers: `getBlockNumber`', async () => {
    await ethersProvider.getBlockNumber()
  })

  bench('ethers@6: `getBlockNumber`', async () => {
    await ethersV6Provider.getBlockNumber()
  })

  bench('web3.js: `getBlockNumber`', async () => {
    await web3Provider.eth.getBlockNumber()
  })
})
