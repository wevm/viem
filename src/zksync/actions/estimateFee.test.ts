import { expect, test } from 'vitest'
import { zkSyncClientLocalNode } from '../../../test/src/zksync.js'
import {
  mockClientPublicActionsL2,
  mockFeeValues,
} from '../../../test/src/zksyncPublicActionsL2MockData.js'
import { estimateFee } from './estimateFee.js'

const client = { ...zkSyncClientLocalNode }

mockClientPublicActionsL2(client)

test('default', async () => {
  const fee = await estimateFee(client, {
    from: '0x',
  })

  expect(fee).to.deep.equal(mockFeeValues)
})
