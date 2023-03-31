import { bench, describe } from 'vitest'

import { publicClient } from '../../_test/index.js'

import { createBlockFilter } from './createBlockFilter.js'

describe.skip('Create Block Filter', () => {
  bench('viem: `createBlockFilter`', async () => {
    await createBlockFilter(publicClient)
  })
})
