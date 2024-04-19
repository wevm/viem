import { expect, test } from 'vitest'
import {
  zkSyncClientLocalNode,
  zkSyncClientWithAccount,
} from '../../../test/src/zksync.js'
import {
  mockAddress,
  mockClientPublicActionsL2,
} from '../../../test/src/zksyncPublicActionsL2MockData.js'
import { getAllBalances } from './getAllBalances.js'

const client = { ...zkSyncClientLocalNode }
const clientWithAccount = zkSyncClientWithAccount

mockClientPublicActionsL2(client)
mockClientPublicActionsL2(clientWithAccount)

test('default with account hoisting', async () => {
  const clientWithAccount = zkSyncClientWithAccount
  const balances = await getAllBalances(clientWithAccount, {})

  const entries = Object.entries(balances)
  for (const [key, value] of entries) {
    expect(typeof key).toBe('string')
    expect(typeof value).toBe('bigint')
  }

  expect(balances['0x0000000000000000000000000000000000000000']).to.equal(
    1000000000000000000n,
  )
  expect(balances['0x0000000000000000000000000000000000000001']).to.equal(
    2000000000000000000n,
  )
  expect(balances['0x0000000000000000000000000000000000000002']).to.equal(
    3500000000000000000n,
  )
})

test('default without account hoisting', async () => {
  const clientWithAccount = client
  const balances = await getAllBalances(clientWithAccount, {
    account: mockAddress,
  })

  const entries = Object.entries(balances)
  for (const [key, value] of entries) {
    expect(typeof key).toBe('string')
    expect(typeof value).toBe('bigint')
  }

  expect(balances['0x0000000000000000000000000000000000000000']).to.equal(
    1000000000000000000n,
  )
  expect(balances['0x0000000000000000000000000000000000000001']).to.equal(
    2000000000000000000n,
  )
  expect(balances['0x0000000000000000000000000000000000000002']).to.equal(
    3500000000000000000n,
  )
})
