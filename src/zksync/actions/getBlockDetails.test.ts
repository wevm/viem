import { expect, test } from 'vitest'
import {
  mockClientPublicActionsL2,
  zksyncClientLocalNode,
} from '../../../test/src/zksync.js'
import { getBlockDetails } from './getBlockDetails.js'

const client = { ...zksyncClientLocalNode }

mockClientPublicActionsL2(client)

test('default', async () => {
  const details = await getBlockDetails(client, { number: 0 })
  expect(details).toMatchInlineSnapshot(`
    {
      "baseSystemContractsHashes": {
        "bootloader": "0x010008bb22aea1e22373cb8d807b15c67eedd65523e9cba4cc556adfa504f7b8",
        "default_aa": "0x010008bb22aea1e22373cb8d807b15c67eedd65523e9cba4cc556adfa504f7b8",
      },
      "l1BatchNumber": 0,
      "l1TxCount": 2,
      "l2TxCount": 3,
      "number": 0,
      "operatorAddress": "0xde03a0b5963f75f1c8485b355ff6d30f3093bde7",
      "protocolVersion": "Version19",
      "status": "verified",
      "timestamp": 1713435780,
    }
  `)
})
