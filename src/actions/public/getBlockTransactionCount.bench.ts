import { bench, describe } from 'vitest'

import { publicClient, setupAnvil } from '../../_test/index.js'

import { getBlockTransactionCount } from './getBlockTransactionCount.js'

setupAnvil()

describe.skip('Get Block Transaction Count', () => {
  bench('viem: `getBlockTransactionCount`', async () => {
    await getBlockTransactionCount(publicClient)
  })
})
