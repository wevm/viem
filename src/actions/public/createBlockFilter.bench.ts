import { publicClient } from '../../_test/utils.js'
import { createBlockFilter } from './createBlockFilter.js'
import { bench, describe } from 'vitest'

describe.skip('Create Block Filter', () => {
  bench('viem: `createBlockFilter`', async () => {
    await createBlockFilter(publicClient)
  })
})
