import { expect, test } from 'vitest'

import {
  accounts,
  publicClient,
  testClient,
  setupAnvil,
} from '../../_test/index.js'
import { getTransactionCount } from '../public/getTransactionCount.js'
import { setNonce } from './setNonce.js'
import { mine } from './mine.js'

setupAnvil()

const targetAccount = accounts[0]

test('sets nonce', async () => {
  await setNonce(testClient, {
    address: targetAccount.address,
    nonce: 420,
  })
  // TODO: There seems to be a bug in anvil here. Setting the nonce only comes into effect after mining a block.
  // This was only surfaced now because this test now runs on a fresh fork.
  await mine(testClient, { blocks: 1 })
  expect(
    await getTransactionCount(publicClient, {
      address: targetAccount.address,
    }),
  ).toBe(420)
  await setNonce(testClient, {
    address: targetAccount.address,
    nonce: 69,
  })
  expect(
    await getTransactionCount(publicClient, {
      address: targetAccount.address,
    }),
  ).toBe(69)
})
