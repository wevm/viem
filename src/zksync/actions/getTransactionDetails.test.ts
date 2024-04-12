import { expect, test } from 'vitest'
import { zkSyncClientZksync } from '~test/src/zksync.js'
import { getTransactionDetails } from './getTransactionDetails.js'

const client = { ...zkSyncClientZksync }

test('default', async () => {
  //TODO: Should probably implement proper test, instead of this.
  await expect(
    getTransactionDetails(client, { txHash: '0x0' }),
  ).rejects.toThrow()
})
