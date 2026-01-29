import { expect, test } from 'vitest'
import {
  mockClientPublicActionsL2,
  zksyncClientLocalNode,
} from '../../../test/src/zksync.js'
import { getTransactionDetails } from './getTransactionDetails.js'

const client = { ...zksyncClientLocalNode }

mockClientPublicActionsL2(client)

test('default', async () => {
  const details = await getTransactionDetails(client, {
    txHash:
      '0xcf89f4076eae08127daa1b2b9bab94a910d232b4a78b116554f7b29af19e35a4',
  })
  expect(details).toMatchInlineSnapshot(`
    {
      "fee": 10n,
      "gasPerPubdata": 50000n,
      "initiatorAddress": "0x000000000000000000000000000000000000800b",
      "isL1Originated": true,
      "receivedAt": 2024-04-18T10:36:57.435Z,
      "status": "validated",
    }
  `)
})
