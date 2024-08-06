import { expect, test } from 'vitest'
import {
  mockClientPublicActionsL2,
  zksyncClientLocalNode,
  zksyncClientLocalNodeWithAccount,
} from '../../../test/src/zksync.js'
import { estimateFee } from './estimateFee.js'

const client = { ...zksyncClientLocalNode }

const clientWithAccount = { ...zksyncClientLocalNodeWithAccount }

mockClientPublicActionsL2(client)

test('default', async () => {
  const fee = await estimateFee(client, {
    account: '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049',
    to: '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049',
    value: 0n,
  })

  expect(fee).toMatchInlineSnapshot(`
    {
      "gasLimit": 163901n,
      "gasPerPubdataLimit": 66n,
      "maxFeePerGas": 250000000n,
      "maxPriorityFeePerGas": 0n,
    }
  `)
})

mockClientPublicActionsL2(clientWithAccount)

test('default with account', async () => {
  const fee = await estimateFee(clientWithAccount, {
    to: '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049',
    value: 0n,
  })

  expect(fee).toMatchInlineSnapshot(`
    {
      "gasLimit": 163901n,
      "gasPerPubdataLimit": 66n,
      "maxFeePerGas": 250000000n,
      "maxPriorityFeePerGas": 0n,
    }
  `)
})
