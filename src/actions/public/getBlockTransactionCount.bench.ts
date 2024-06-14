import { bench, describe } from 'vitest'

import { anvilMainnet } from '../../../test/src/anvil.js'

import { getBlockTransactionCount } from './getBlockTransactionCount.js'

const client = anvilMainnet.getClient()

describe.skip('Get Block Transaction Count', () => {
  bench('viem: `getBlockTransactionCount`', async () => {
    await getBlockTransactionCount(client)
  })
})
