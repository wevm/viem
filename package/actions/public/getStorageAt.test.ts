import { expect, test } from 'vitest'

import { wagmiContractConfig } from '~test/src/abis.js'
import { forkBlockNumber } from '~test/src/constants.js'
import { publicClient } from '~test/src/utils.js'

import { getStorageAt } from './getStorageAt.js'

test('default', async () => {
  expect(
    await getStorageAt(publicClient, {
      address: wagmiContractConfig.address,
      slot: '0x0',
    }),
  ).toBe('0x7761676d6900000000000000000000000000000000000000000000000000000a')
  expect(
    await getStorageAt(publicClient, {
      address: wagmiContractConfig.address,
      slot: '0x1',
    }),
  ).toBe('0x5741474d4900000000000000000000000000000000000000000000000000000a')
})

test('args: blockNumber', async () => {
  expect(
    await getStorageAt(publicClient, {
      address: wagmiContractConfig.address,
      slot: '0x0',
      blockNumber: forkBlockNumber,
    }),
  ).toBe('0x7761676d6900000000000000000000000000000000000000000000000000000a')
})
