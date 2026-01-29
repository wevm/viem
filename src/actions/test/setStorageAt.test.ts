import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'

import { anvilMainnet } from '../../../test/src/anvil.js'

import { setStorageAt } from './setStorageAt.js'

const client = anvilMainnet.getClient()

const targetAccount = accounts[0]

test('sets storage', async () => {
  await expect(
    setStorageAt(client, {
      address: targetAccount.address,
      index: 0,
      value:
        '0x0000000000000000000000000000000000000000000000000000000000003039',
    }),
  ).resolves.toBeUndefined()
  expect(
    await client.request({
      method: 'eth_getStorageAt',
      params: [targetAccount.address, '0x0', 'latest'],
    }),
  ).toBe('0x0000000000000000000000000000000000000000000000000000000000003039')

  await setStorageAt(client, {
    address: targetAccount.address,
    index: '0xa6eef7e35abe7026729641147f7915573c7e97b47efa546f5f6e3230263bcb49',
    value: '0x0000000000000000000000000000000000000000000000000000000000003039',
  })
  expect(
    await client.request({
      method: 'eth_getStorageAt',
      params: [
        targetAccount.address,
        '0xa6eef7e35abe7026729641147f7915573c7e97b47efa546f5f6e3230263bcb49',
        'latest',
      ],
    }),
  ).toBe('0x0000000000000000000000000000000000000000000000000000000000003039')
})
