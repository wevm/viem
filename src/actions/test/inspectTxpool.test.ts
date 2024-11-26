import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { sendTransaction } from '../wallet/sendTransaction.js'
import { inspectTxpool } from './inspectTxpool.js'
import { mine } from './mine.js'

const client = anvilMainnet.getClient()

test('inspects txpool (empty)', async () => {
  await mine(client, { blocks: 1 })

  expect(await inspectTxpool(client)).toMatchInlineSnapshot(`
    {
      "pending": {},
      "queued": {},
    }
  `)
})

test('inspects txpool (pending)', async () => {
  await sendTransaction(client, {
    account: accounts[0].address,
    to: accounts[1].address,
    value: parseEther('2'),
  })
  await sendTransaction(client, {
    account: accounts[2].address,
    to: accounts[3].address,
    value: parseEther('3'),
  })

  const txpool1 = await inspectTxpool(client)
  expect(Object.values(txpool1.pending).length).toBe(2)
  expect(Object.values(txpool1.queued).length).toBe(0)
  expect(txpool1.pending[accounts[0].address]).toBeDefined()
  expect(txpool1.pending[accounts[2].address]).toBeDefined()

  await mine(client, { blocks: 1 })

  const txpool2 = await inspectTxpool(client)
  expect(Object.values(txpool2.pending).length).toBe(0)
  expect(Object.values(txpool2.queued).length).toBe(0)
  expect(txpool2.pending[accounts[0].address]).toBeUndefined()
  expect(txpool2.pending[accounts[2].address]).toBeUndefined()
})
