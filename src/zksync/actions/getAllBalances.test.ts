import { expect, test } from 'vitest'
import { zkSyncClientLocalNode } from '../../../test/src/zksync.js'
import { mockAccountBalances } from '../../../test/src/zksyncMockData.js'
import type { EIP1193RequestFn } from '../../types/eip1193.js'
import { getAllBalances } from './getAllBalances.js'

const client = { ...zkSyncClientLocalNode }

client.request = (async ({ method, params }) => {
  if (method === 'zks_getAllAccountBalances') return mockAccountBalances
  return zkSyncClientLocalNode.request({ method, params } as any)
}) as EIP1193RequestFn

test('default', async () => {
  const balances = await getAllBalances(client, {
    address: '0x36615Cf349d7F6344891B1e7CA7C72883F5dc049',
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
