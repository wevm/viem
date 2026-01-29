import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { sendTransaction } from '../wallet/sendTransaction.js'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { snapshot } from './snapshot.js'

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

const client = anvilMainnet.getClient()

test('snapshots', async () => {
  await sendTransaction(client, {
    account: sourceAccount.address,
    to: targetAccount.address,
    value: parseEther('1'),
  })
  expect(await snapshot(client)).toBeDefined()
})
