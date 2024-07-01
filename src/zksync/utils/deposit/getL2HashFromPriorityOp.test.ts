import { expect, test } from 'vitest'
import { zkSyncClientLocalNodeWithAccountL1 } from '~test/src/zksync.js'
import {
  mockClientPublicActionsL2,
  mockL1TxReceipt,
} from '~test/src/zksyncPublicActionsL2MockData.js'
import { getL2HashFromPriorityOp } from './getL2HashFromPriorityOp.js'

const client = { ...zkSyncClientLocalNodeWithAccountL1 }

mockClientPublicActionsL2(client)

test('getL2HashFromPriorityOp', async () => {
  const hash = await getL2HashFromPriorityOp({
    l1TransactionReceipt: mockL1TxReceipt,
    zksyncMainContractAddress: '0x38969c7b1a39893c176d37bd9b61225d62b7e851',
  })
  expect(hash).toEqual(
    '0x1414b49119ba22f4df715d78a22e8aa94f9d4fefe694fd19a43ca90bc69c6187',
  )
})
