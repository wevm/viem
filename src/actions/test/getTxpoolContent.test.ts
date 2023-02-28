import { expect, test } from 'vitest'

import { accounts, testClient, walletClient } from '../../_test'
import { getAccount, parseEther } from '../../utils'
import { sendTransaction } from '../wallet/sendTransaction'

import { getTxpoolContent } from './getTxpoolContent'
import { mine } from './mine'

test('gets txpool content (empty)', async () => {
  await mine(testClient, { blocks: 1 })

  expect(await getTxpoolContent(testClient)).toMatchInlineSnapshot(`
    {
      "pending": {},
      "queued": {},
    }
  `)
})

test('gets txpool content (pending)', async () => {
  await sendTransaction(walletClient, {
    account: getAccount(accounts[0].address),
    to: accounts[1].address,
    value: parseEther('2'),
  })
  await sendTransaction(walletClient, {
    account: getAccount(accounts[2].address),
    to: accounts[3].address,
    value: parseEther('3'),
  })
  const content1 = await getTxpoolContent(testClient)
  expect(Object.values(content1.pending).length).toBe(2)
  expect(Object.values(content1.queued).length).toBe(0)
  expect(content1.pending[accounts[0].address]).toBeDefined()
  expect(content1.pending[accounts[2].address]).toBeDefined()

  await mine(testClient, { blocks: 1 })

  const content2 = await getTxpoolContent(testClient)
  expect(Object.values(content2.pending).length).toBe(0)
  expect(Object.values(content2.queued).length).toBe(0)
  expect(content2.pending[accounts[0].address]).toBeUndefined()
  expect(content2.pending[accounts[2].address]).toBeUndefined()
})
