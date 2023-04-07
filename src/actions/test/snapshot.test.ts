import { expect, test } from 'vitest'

import { accounts, testClient, walletClient } from '../../_test/index.js'
import { parseEther } from '../../utils/index.js'
import { sendTransaction } from '../wallet/sendTransaction.js'
import { snapshot } from './snapshot.js'

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

test('snapshots', async () => {
  await sendTransaction(walletClient, {
    account: sourceAccount.address,
    to: targetAccount.address,
    value: parseEther('1'),
  })
  expect(await snapshot(testClient)).toBeDefined()
})
