import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { getTransactionCount } from '../public/getTransactionCount.js'

import { anvilMainnet } from '../../../test/src/anvil.js'

import { mine } from './mine.js'
import { setNonce } from './setNonce.js'

const client = anvilMainnet.getClient()

const targetAccount = accounts[0]

test('sets nonce', async () => {
  await expect(
    setNonce(client, {
      address: targetAccount.address,
      nonce: 420,
    }),
  ).resolves.toBeUndefined()
  await mine(client, { blocks: 1 })
  expect(
    await getTransactionCount(client, {
      address: targetAccount.address,
    }),
  ).toBe(420)
  await setNonce(client, {
    address: targetAccount.address,
    nonce: 69,
  })
  expect(
    await getTransactionCount(client, {
      address: targetAccount.address,
    }),
  ).toBe(69)
})
