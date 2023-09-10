import { assertType, expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { publicClient, testClient, walletClient } from '~test/src/utils.js'
import type { EIP1193RequestFn } from '../../types/eip1193.js'
import type { Hash } from '../../types/misc.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { mine } from '../test/mine.js'
import { sendTransaction } from '../wallet/sendTransaction.js'
import { createPendingTransactionFilter } from './createPendingTransactionFilter.js'
import { getFilterChanges } from './getFilterChanges.js'
import { uninstallFilter } from './uninstallFilter.js'

const request = (() => {}) as unknown as EIP1193RequestFn

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
      filter: { id: '0x1', request, type: 'default' },
    }),
  ).toBeFalsy()
})

test('filter already uninstalled', async () => {
  const filter = await createPendingTransactionFilter(publicClient)
  expect(await uninstallFilter(publicClient, { filter })).toBeTruthy()
  expect(await uninstallFilter(publicClient, { filter })).toBeFalsy()
})
