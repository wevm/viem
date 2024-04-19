import { expect, test } from 'vitest'
import { zkSyncClientLocalNode } from '../../../test/src/zksync.js'
import { mockRawBlockTransaction } from '../../../test/src/zksyncMockData.js'
import type { EIP1193RequestFn } from '../../types/eip1193.js'
import { getRawBlockTransactions } from './getRawBlockTransaction.js'

const client = { ...zkSyncClientLocalNode }

client.request = (async ({ method, params }) => {
  if (method === 'zks_getRawBlockTransactions') return mockRawBlockTransaction
  return zkSyncClientLocalNode.request({ method, params } as any)
}) as EIP1193RequestFn

test('default', async () => {
  const transactions = await getRawBlockTransactions(client, {
    number: 1,
  })
  expect(transactions).not.toBeUndefined()
  expect(transactions).toHaveLength(1)
  expect(transactions).toEqual(mockRawBlockTransaction)

  expect(transactions[0].execute.contractAddress).toBe(
    '0x000000000000000000000000000000000000800b',
  )
  expect(transactions[0].execute.calldata).toBe(
    '0xef0e2ff4000000000000000000000000000000000000000000000000000000000000010e',
  )
  expect(transactions[0].execute.value).toBe(0n)
  expect(transactions[0].execute.factoryDeps).toEqual('0x')
  expect(transactions[0].received_timestamp_ms).toBe(1713436617435)
})
