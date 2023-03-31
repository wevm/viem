import { assertType, expect, test } from 'vitest'

import {
  accounts,
  publicClient,
  testClient,
  walletClient,
} from '../../_test/index.js'

import { createPendingTransactionFilter } from './createPendingTransactionFilter.js'
import { getFilterChanges } from './getFilterChanges.js'
import { uninstallFilter } from './uninstallFilter.js'
import { mine } from '../test/index.js'
import { sendTransaction } from '../wallet/index.js'
import { parseEther } from '../../utils/index.js'
import type { Hash } from '../../types/index.js'

test('default', async () => {
  const filter = await createPendingTransactionFilter(publicClient)
  expect(await uninstallFilter(publicClient, { filter })).toBeTruthy()
})

test('pending txns', async () => {
  const filter = await createPendingTransactionFilter(publicClient)

  await sendTransaction(walletClient, {
    account: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })
  await sendTransaction(walletClient, {
    account: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })

  let hashes = await getFilterChanges(publicClient, { filter })
  assertType<Hash[]>(hashes)
  expect(hashes.length).toBe(2)

  mine(testClient, { blocks: 1 })

  hashes = await getFilterChanges(publicClient, { filter })
  expect(hashes.length).toBe(0)

  expect(await uninstallFilter(publicClient, { filter })).toBeTruthy()

  await sendTransaction(walletClient, {
    account: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })

  hashes = await getFilterChanges(publicClient, { filter })
  expect(hashes.length).toBe(0)
})

test('filter does not exist', async () => {
  expect(
    await uninstallFilter(publicClient, {
      filter: { id: '0x1', type: 'default' },
    }),
  ).toBeFalsy()
})

test('filter already uninstalled', async () => {
  const filter = await createPendingTransactionFilter(publicClient)
  expect(await uninstallFilter(publicClient, { filter })).toBeTruthy()
  expect(await uninstallFilter(publicClient, { filter })).toBeFalsy()
})
