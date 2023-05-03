import { beforeAll, bench, describe } from 'vitest'

import {
  ethersProvider,
  ethersV6Provider,
  publicClient,
  setBlockNumber,
} from '../../_test/index.js'
import { getEnsAddress } from './getEnsAddress.js'

beforeAll(async () => {
  await setBlockNumber(16773780n)
})

describe('Get ENS Name', () => {
  bench('viem: `getEnsAddress`', async () => {
    await getEnsAddress(publicClient, { name: 'awkweb.eth' })
  })

  bench('ethers: `resolveName`', async () => {
    await ethersProvider.resolveName('awkweb.eth')
  })

  bench('ethers@6: `resolveName`', async () => {
    await ethersV6Provider.resolveName('awkweb.eth')
  })
})
