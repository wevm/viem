import { expect, test } from 'vitest'

import { accounts, testClient, walletClient } from '../../_test/index.js'
import { parseEther } from '../../utils/index.js'
import { sendTransaction } from '../wallet/sendTransaction.js'

import { getTxpoolStatus } from './getTxpoolStatus.js'
import { mine } from './mine.js'

test('gets txpool content (empty)', async () => {
  await mine(testClient, { blocks: 1 })

  expect(await getTxpoolStatus(testClient)).toMatchInlineSnapshot(`
    {
      "pending": 0,
      "queued": 0,
    }
  `)
})

test('gets txpool content (pending)', async () => {
  await sendTransaction(walletClient, {
    account: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('2'),
  })
  await sendTransaction(walletClient, {
    account: accounts[2].address,
    to: accounts[3].address,
    value: parseEther('3'),
  })
  const status1 = await getTxpoolStatus(testClient)
  expect(status1.pending).toBe(2)
  expect(status1.queued).toBe(0)

  await mine(testClient, { blocks: 1 })

  const status2 = await getTxpoolStatus(testClient)
  expect(status2.pending).toBe(0)
  expect(status2.queued).toBe(0)
})
