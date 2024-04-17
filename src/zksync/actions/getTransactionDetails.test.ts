import { expect, test } from 'vitest'
import { zkSyncClientLocalNode } from '../../../test/src/zksync.js'
import { getTransactionDetails } from './getTransactionDetails.js'

const client = { ...zkSyncClientLocalNode }

test('default', async () => {
  //TODO: Should probably implement proper test, instead of this.
  await expect(
    getTransactionDetails(client, { txHash: '0x0' }),
  ).rejects.toThrow()
})
