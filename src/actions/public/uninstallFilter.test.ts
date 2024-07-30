import { assertType, expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { anvilMainnet } from '../../../test/src/anvil.js'

import type { EIP1193RequestFn } from '../../types/eip1193.js'
import type { Hash } from '../../types/misc.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { mine } from '../test/mine.js'
import { sendTransaction } from '../wallet/sendTransaction.js'
import { createPendingTransactionFilter } from './createPendingTransactionFilter.js'
import { getFilterChanges } from './getFilterChanges.js'
import { uninstallFilter } from './uninstallFilter.js'

const client = anvilMainnet.getClient()

const request = (() => {}) as unknown as EIP1193RequestFn

test('default', async () => {
  const filter = await createPendingTransactionFilter(client)
  expect(await uninstallFilter(client, { filter })).toBeTruthy()
})

test('pending txns', async () => {
  const filter = await createPendingTransactionFilter(client)

  await sendTransaction(client, {
    account: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })
  await sendTransaction(client, {
    account: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })

  let hashes = await getFilterChanges(client, { filter })
  assertType<Hash[]>(hashes)
  expect(hashes.length).toBe(2)

  mine(client, { blocks: 1 })

  hashes = await getFilterChanges(client, { filter })
  expect(hashes.length).toBe(0)

  expect(await uninstallFilter(client, { filter })).toBeTruthy()

  await sendTransaction(client, {
    account: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('1'),
  })

  hashes = await getFilterChanges(client, { filter })
  expect(hashes.length).toBe(0)
})

test('filter does not exist', async () => {
  expect(
    await uninstallFilter(client, {
      filter: { id: '0x1', request, type: 'default' },
    }),
  ).toBeFalsy()
})

test('filter already uninstalled', async () => {
  const filter = await createPendingTransactionFilter(client)
  expect(await uninstallFilter(client, { filter })).toBeTruthy()
  expect(await uninstallFilter(client, { filter })).toBeFalsy()
})
