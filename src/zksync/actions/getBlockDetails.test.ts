import { expect, test } from 'vitest'
import { zkSyncClientLocalNode } from '../../../test/src/zksync.js'
import {
  mockBlockDetails,
  mockClientPublicActionsL2,
} from '../../../test/src/zksyncPublicActionsL2MockData.js'
import { getBlockDetails } from './getBlockDetails.js'

const client = { ...zkSyncClientLocalNode }

mockClientPublicActionsL2(client)

test('default', async () => {
  const details = await getBlockDetails(client, { number: 0 })
  expect(details).to.equal(mockBlockDetails)
  expect(details.number).toEqual(0)
  expect(details.timestamp).toEqual(1713435780)
  expect(details.l1BatchNumber).toEqual(0)
  expect(details.l1TxCount).toEqual(2)
  expect(details.l2TxCount).toEqual(3)
  expect(details.status).toEqual('verified')
  expect(details.baseSystemContractsHashes.bootloader).toEqual(
    '0x010008bb22aea1e22373cb8d807b15c67eedd65523e9cba4cc556adfa504f7b8',
  )
  expect(details.baseSystemContractsHashes.default_aa).toEqual(
    '0x010008bb22aea1e22373cb8d807b15c67eedd65523e9cba4cc556adfa504f7b8',
  )
})
