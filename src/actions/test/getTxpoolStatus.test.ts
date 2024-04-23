import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { sendTransaction } from '../wallet/sendTransaction.js'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { getTxpoolStatus } from './getTxpoolStatus.js'
import { mine } from './mine.js'

const client = anvilMainnet.getClient()

test('gets txpool content (empty)', async () => {
  await mine(client, { blocks: 1 })

  expect(await getTxpoolStatus(client)).toMatchInlineSnapshot(`
    {
      "pending": 0,
      "queued": 0,
    }
  `)
})

test('gets txpool content (pending)', async () => {
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
  const status1 = await getTxpoolStatus(client)
  expect(status1.pending).toBe(2)
  expect(status1.queued).toBe(0)

  await mine(client, { blocks: 1 })

  const status2 = await getTxpoolStatus(client)
  expect(status2.pending).toBe(0)
  expect(status2.queued).toBe(0)
})
