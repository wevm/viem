import { beforeAll, bench, describe } from 'vitest'

import { ethersProvider } from '~test/src/bench.js'
import { setBlockNumber } from '~test/src/utils.js'

import { anvilMainnet } from '../../../test/src/anvil.js'

import { getEnsAddress } from './getEnsAddress.js'

const client = anvilMainnet.getClient()

beforeAll(async () => {
  await setBlockNumber(client, 16773780n)
})

describe('Get ENS Name', () => {
  bench('viem: `getEnsAddress`', async () => {
    await getEnsAddress(client, { name: 'awkweb.eth' })
  })

  bench('ethers: `resolveName`', async () => {
    await ethersProvider.resolveName('awkweb.eth')
  })
})
