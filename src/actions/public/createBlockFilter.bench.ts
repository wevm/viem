import { bench, describe } from 'vitest'

import { publicClient } from '../../_test'

import { createBlockFilter } from './createBlockFilter'

describe.skip('Create Block Filter', () => {
  bench('viem: `createBlockFilter`', async () => {
    await createBlockFilter(publicClient)
  })
})
