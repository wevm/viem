import { assertType, expect, test } from 'vitest'

import { accounts, publicClient, testClient, walletClient } from '../../../test'

import { createPendingTransactionFilter } from './createPendingTransactionFilter'
import { getFilterChanges } from './getFilterChanges'
import { mine } from '../test'
import { sendTransaction } from '../wallet'
import { parseEther } from '../../utils'
import type { Data } from '../../types'

test('default', async () => {
  const filter = await createPendingTransactionFilter(publicClient)
  expect(
    await getFilterChanges(publicClient, { filter }),
  ).toMatchInlineSnapshot('[]')
})

test('pending txns', async () => {
  const filter = await createPendingTransactionFilter(publicClient)

  await sendTransaction(walletClient, {
    request: {
      from: accounts[0].address,
      to: accounts[1].address,
      value: parseEther('1'),
    },
  })
  await sendTransaction(walletClient, {
    request: {
      from: accounts[0].address,
      to: accounts[1].address,
      value: parseEther('1'),
    },
  })

  let hashes = await getFilterChanges(publicClient, { filter })
  assertType<Data[]>(hashes)
  expect(hashes.length).toBe(2)

  mine(testClient, { blocks: 1 })

  hashes = await getFilterChanges(publicClient, { filter })
  expect(hashes.length).toBe(0)

  await sendTransaction(walletClient, {
    request: {
      from: accounts[0].address,
      to: accounts[1].address,
      value: parseEther('1'),
    },
  })

  hashes = await getFilterChanges(publicClient, { filter })
  expect(hashes.length).toBe(1)
})
