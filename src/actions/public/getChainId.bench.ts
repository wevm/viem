import { bench, describe } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'

import { getChainId } from './getChainId.js'

const client = anvilMainnet.getClient()

describe.skip('Get Chain ID', () => {
  bench('viem: `getChainId`', async () => {
    await getChainId(client)
  })
})
