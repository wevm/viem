import { expect, test } from 'vitest'
import {
  mockClientPublicActionsL2,
  zksyncClientLocalNode,
  zksyncClientLocalNodeWithAccount,
} from '../../../test/src/zksync.js'
import { estimateGasL1ToL2 } from './estimateGasL1ToL2.js'

const client = { ...zksyncClientLocalNode }

const clientWithAccount = { ...zksyncClientLocalNodeWithAccount }

mockClientPublicActionsL2(client)
mockClientPublicActionsL2(clientWithAccount)

test('default with account', async () => {
  const value = await estimateGasL1ToL2(clientWithAccount, {
    to: '0xa61464658AfeAf65CccaaFD3a512b69A83B77618',
    value: 70n,
  })
  expect(value > 0).to.be.true
})

test('default without account', async () => {
  const value = await estimateGasL1ToL2(client, {
    account: '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049',
    to: '0xa61464658AfeAf65CccaaFD3a512b69A83B77618',
    value: 70n,
  })
  expect(value > 0).to.be.true
})
