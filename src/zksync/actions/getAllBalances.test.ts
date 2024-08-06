import { expect, test } from 'vitest'
import {
  mockAddress,
  mockClientPublicActionsL2,
  zksyncClientLocalNode,
  zksyncClientLocalNodeWithAccount,
} from '../../../test/src/zksync.js'
import { getAllBalances } from './getAllBalances.js'

const client = { ...zksyncClientLocalNode }
const clientWithAccount = zksyncClientLocalNodeWithAccount

mockClientPublicActionsL2(client)
mockClientPublicActionsL2(clientWithAccount)

test('default with account hoisting', async () => {
  const balances = await getAllBalances(clientWithAccount, {})

  expect(balances).toMatchInlineSnapshot(`
    {
      "0x0000000000000000000000000000000000000000": 1000000000000000000n,
      "0x0000000000000000000000000000000000000001": 2000000000000000000n,
      "0x0000000000000000000000000000000000000002": 3500000000000000000n,
    }
  `)
})

test('default without account hoisting', async () => {
  const balances = await getAllBalances(client, {
    account: mockAddress,
  })

  expect(balances).toMatchInlineSnapshot(`
    {
      "0x0000000000000000000000000000000000000000": 1000000000000000000n,
      "0x0000000000000000000000000000000000000001": 2000000000000000000n,
      "0x0000000000000000000000000000000000000002": 3500000000000000000n,
    }
  `)
})
