import { expect, test } from 'vitest'

import { accounts, testClient, walletClient } from '../../../test'
import { etherToValue } from '../../utils'
import { sendTransaction } from '../transaction/sendTransaction'
import { snapshot } from './snapshot'

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

test('snapshots', async () => {
  await sendTransaction(walletClient, {
    request: {
      from: sourceAccount.address,
      to: targetAccount.address,
      value: etherToValue('1'),
    },
  })
  expect(await snapshot(testClient)).toBeDefined()
})
