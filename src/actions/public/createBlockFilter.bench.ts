import { bench, describe } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'

import { createBlockFilter } from './createBlockFilter.js'

const client = anvilMainnet.getClient()

describe.skip('Create Block Filter', () => {
  bench('viem: `createBlockFilter`', async () => {
    await createBlockFilter(client)
  })
})
