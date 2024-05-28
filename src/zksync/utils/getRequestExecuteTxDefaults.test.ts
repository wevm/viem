import { expect, test } from 'vitest'
import { mockAddress } from '~test/src/zksyncPublicActionsL2MockData.js'
import {
  mockClientPublicActionsL2,
  zkSyncClientLocalNodeWithAccount,
} from '../../../test/src/zksync.js'
import { getRequestExecuteTxDefaults } from './getRequestExecuteTxDefaults.js'

const client = { ...zkSyncClientLocalNodeWithAccount }

mockClientPublicActionsL2(client)

test('default', async () => {
  const requestExecuteDefaults = await getRequestExecuteTxDefaults(client, {
    token: mockAddress,
    amount: 1n,
    bridgehubContractAddress: mockAddress,
    l2ChainId: BigInt(client.chain!.id!),
    eRC20DefaultBridgeData: '0x',
    baseCost: 100n,
    mintValue: 1n,
    l2Value: 0n,
    contractAddress: client.account.address,
    calldata: '0x',
  })
  expect(requestExecuteDefaults).toMatchInlineSnapshot(`
    {
      "amount": 1n,
      "baseCost": 100n,
      "bridgehubContractAddress": "0x173999892363ba18c9dc60f8c57152fc914bce89",
      "calldata": "0x",
      "contractAddress": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      "eRC20DefaultBridgeData": "0x",
      "gasPerPubdataByte": 800n,
      "l2ChainId": 270n,
      "l2GasLimit": 123456789n,
      "l2Value": 0n,
      "mintValue": 1n,
      "operatorTip": 0n,
      "overrides": {
        "factoryDeps": [],
        "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "maxFeePerGas": 150000000100n,
        "maxPriorityFeePerGas": 150000000000n,
      },
      "refundRecipient": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      "token": "0x173999892363ba18c9dc60f8c57152fc914bce89",
    }
  `)
})
