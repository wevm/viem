import { expect, test } from 'vitest'

import { accounts, testClient, walletClient } from '../../_test'
import { parseEther } from '../../utils'
import { sendTransaction } from '../wallet/sendTransaction'
import { snapshot } from './snapshot'

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

test('snapshots', async () => {
  await sendTransaction(walletClient, {
    from: sourceAccount.address,
    to: targetAccount.address,
    value: parseEther('1'),
  })
  expect(await snapshot(testClient)).toBeDefined()
})
