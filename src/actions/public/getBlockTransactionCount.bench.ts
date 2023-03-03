import { bench, describe } from 'vitest'

import { publicClient } from '../../_test'

import { getBlockTransactionCount } from './getBlockTransactionCount'

describe.skip('Get Block Transaction Count', () => {
  bench('viem: `getBlockTransactionCount`', async () => {
    await getBlockTransactionCount(publicClient)
  })
})
