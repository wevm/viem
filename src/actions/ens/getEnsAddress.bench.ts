import { bench, describe } from 'vitest'

import {
  ethersProvider,
  ethersV6Provider,
  publicClient,
  web3Provider,
} from '../../_test'

import { getEnsAddress } from './getEnsAddress'

describe('Get ENS Name', () => {
  bench('viem: `getEnsAddress`', async () => {
    await getEnsAddress(publicClient, {
      name: 'awkweb.eth',
    })
  })

  bench('ethers: `resolveName`', async () => {
    await ethersProvider.resolveName('awkweb.eth')
  })

  bench('ethers@6: `resolveName`', async () => {
    await ethersV6Provider.resolveName('awkweb.eth')
  })
})
