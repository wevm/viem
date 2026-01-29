import { expect, test } from 'vitest'
import {
  mockAddress,
  mockClientPublicActionsL2,
  mockTestnetPaymasterAddress,
  zksyncClientLocalNode,
} from '../../../test/src/zksync.js'
import type { EIP1193RequestFn } from '../../types/eip1193.js'
import { getTestnetPaymasterAddress } from './getTestnetPaymasterAddress.js'

const client = { ...zksyncClientLocalNode }

mockClientPublicActionsL2(client)

test('default', async () => {
  const address = await getTestnetPaymasterAddress(client)
  expect(address).to.equal(mockTestnetPaymasterAddress)
})

test('returns null as address', async () => {
  client.request = (async ({ method }) => {
    if (method === 'zks_getTestnetPaymaster') return null
    return mockAddress
  }) as EIP1193RequestFn

  const address = await getTestnetPaymasterAddress(client)
  expect(address).to.equal(null)
})
