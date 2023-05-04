import { wagmiContractConfig } from '../../_test/abis.js'
import { forkBlockNumber } from '../../_test/constants.js'
import { publicClient } from '../../_test/utils.js'
import { getStorageAt } from './getStorageAt.js'
import { expect, test } from 'vitest'

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
