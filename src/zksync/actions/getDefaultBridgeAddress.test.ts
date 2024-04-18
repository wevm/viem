import { expect, test } from 'vitest'
import { zkSyncClientLocalNode } from '../../../test/src/zksync.js'
import { mockAddresses } from '../../../test/src/zksyncMockData.js'
import type { EIP1193RequestFn } from '../../types/eip1193.js'
import { getDefaultBridgeAddresses } from './getDefaultBridgeAddress.js'

const client = { ...zkSyncClientLocalNode }

client.request = (({ method, params }: { method: string; params: unknown }) => {
  if (method === 'zks_getBridgeContracts') return mockAddresses
  return zkSyncClientLocalNode.request({ method, params } as any)
}) as EIP1193RequestFn

test('default', async () => {
  const addresses = await getDefaultBridgeAddresses(client)
  expect(addresses).toHaveProperty('erc20L1')
  expect(addresses).toHaveProperty('sharedL1')
  expect(addresses).toHaveProperty('sharedL2')

  expect(typeof addresses.erc20L1).toBe('string')
  expect(typeof addresses.sharedL1).toBe('string')
  expect(typeof addresses.sharedL2).toBe('string')

  expect(addresses.erc20L1).to.equal(mockAddresses.l1Erc20DefaultBridge)
  expect(addresses.sharedL1).to.equal(mockAddresses.l1SharedDefaultBridge)
  expect(addresses.sharedL2).to.equal(mockAddresses.l2SharedDefaultBridge)
})
