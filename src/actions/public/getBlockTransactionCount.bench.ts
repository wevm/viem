import { publicClient } from '../../_test/utils.js'
import { getBlockTransactionCount } from './getBlockTransactionCount.js'
import { bench, describe } from 'vitest'

describe.skip('Get Block Transaction Count', () => {
  bench('viem: `getBlockTransactionCount`', async () => {
    await getBlockTransactionCount(publicClient)
  })
})
