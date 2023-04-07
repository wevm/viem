import { bench, describe } from 'vitest'

import { publicClient } from '../../_test/index.js'

import { getBlockTransactionCount } from './getBlockTransactionCount.js'

describe.skip('Get Block Transaction Count', () => {
  bench('viem: `getBlockTransactionCount`', async () => {
    await getBlockTransactionCount(publicClient)
  })
})
