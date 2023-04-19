import { bench, describe } from 'vitest'

import { publicClient, setupAnvil } from '../../_test/index.js'

import { createBlockFilter } from './createBlockFilter.js'

setupAnvil()

describe.skip('Create Block Filter', () => {
  bench('viem: `createBlockFilter`', async () => {
    await createBlockFilter(publicClient)
  })
})
