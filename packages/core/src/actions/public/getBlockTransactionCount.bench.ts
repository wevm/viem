import { bench, describe } from 'vitest'

import { publicClient } from '../../../test'

import { getBlockTransactionCount } from './getBlockTransactionCount'

describe('Get Block Transaction Count', () => {
  bench('viem: `getBlockTransactionCount`', async () => {
    await getBlockTransactionCount(publicClient)
  })
})
