import { beforeAll, bench, describe } from 'vitest'

import { ethersProvider } from '~test/src/bench.js'
import { publicClient, setBlockNumber } from '~test/src/utils.js'

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
})
