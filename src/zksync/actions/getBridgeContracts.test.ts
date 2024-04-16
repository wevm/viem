import { expect, test } from 'vitest'
import { zkSyncClientZksync } from '~test/src/zksync.js'
import { getDefaultBridgeAddresses } from './getBridgeContracts.js'

const client = { ...zkSyncClientZksync }

test('default', async () => {
  const addresses = await getDefaultBridgeAddresses(client)

  expect(addresses).toHaveProperty('erc20L1')
  expect(addresses).toHaveProperty('sharedL1')
  expect(addresses).toHaveProperty('sharedL2')

  expect(typeof addresses.erc20L1).toBe('string')
  expect(typeof addresses.sharedL1).toBe('string')
  expect(typeof addresses.sharedL2).toBe('string')
})
