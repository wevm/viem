import { expect, test } from 'vitest'

import { accounts, testClient, walletClient } from '../../../test'
import { parseEther } from '../../utils'
import { sendTransaction } from '../transaction/sendTransaction'

import { inspectTxpool } from './inspectTxpool'
import { mine } from './mine'

test('inspects txpool (empty)', async () => {
  expect(await inspectTxpool(testClient)).toMatchInlineSnapshot(`
    {
      "pending": {},
      "queued": {},
    }
  `)
})

test('inspects txpool (pending)', async () => {
  await sendTransaction(walletClient, {
    request: {
      from: accounts[0].address,
      to: accounts[1].address,
      value: parseEther('2'),
    },
  })
  await sendTransaction(walletClient, {
    request: {
      from: accounts[2].address,
      to: accounts[3].address,
      value: parseEther('3'),
    },
  })

  const txpool1 = await inspectTxpool(testClient)
  expect(Object.values(txpool1.pending).length).toBe(2)
  expect(Object.values(txpool1.queued).length).toBe(0)
  expect(txpool1.pending[accounts[0].address]).toBeDefined()
  expect(txpool1.pending[accounts[2].address]).toBeDefined()

  await mine(testClient, { blocks: 1 })

  const txpool2 = await inspectTxpool(testClient)
  expect(Object.values(txpool2.pending).length).toBe(0)
  expect(Object.values(txpool2.queued).length).toBe(0)
  expect(txpool2.pending[accounts[0].address]).toBeUndefined()
  expect(txpool2.pending[accounts[2].address]).toBeUndefined()
})
