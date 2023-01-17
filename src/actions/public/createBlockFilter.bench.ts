import { bench, describe } from 'vitest'

import { publicClient } from '../../../test'

import { createBlockFilter } from './createBlockFilter'

describe('Create Block Filter', () => {
  bench('viem: `createBlockFilter`', async () => {
    await createBlockFilter(publicClient)
  })
})
