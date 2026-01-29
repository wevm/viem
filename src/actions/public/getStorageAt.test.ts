import { expect, test } from 'vitest'

import { wagmiContractConfig } from '~test/src/abis.js'
import { anvilMainnet } from '../../../test/src/anvil.js'

import { getStorageAt } from './getStorageAt.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  expect(
    await getStorageAt(client, {
      address: wagmiContractConfig.address,
      slot: '0x0',
    }),
  ).toBe('0x7761676d6900000000000000000000000000000000000000000000000000000a')
  expect(
    await getStorageAt(client, {
      address: wagmiContractConfig.address,
      slot: '0x1',
    }),
  ).toBe('0x5741474d4900000000000000000000000000000000000000000000000000000a')
})

test('args: blockNumber', async () => {
  expect(
    await getStorageAt(client, {
      address: wagmiContractConfig.address,
      slot: '0x0',
      blockNumber: anvilMainnet.forkBlockNumber,
    }),
  ).toBe('0x7761676d6900000000000000000000000000000000000000000000000000000a')
})
