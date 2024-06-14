import { expect, test } from 'vitest'

import { accounts, address } from '~test/src/constants.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { sendTransaction } from '../wallet/sendTransaction.js'

import { anvilMainnet } from '../../../test/src/anvil.js'
import { impersonateAccount } from './impersonateAccount.js'
import { stopImpersonatingAccount } from './stopImpersonatingAccount.js'

const client = anvilMainnet.getClient()

test('stops impersonating account', async () => {
  await impersonateAccount(client, { address: address.vitalik })

  expect(
    await sendTransaction(client, {
      account: address.vitalik,
      to: accounts[0].address,
      value: parseEther('1'),
    }),
  ).toBeDefined()

  await expect(
    stopImpersonatingAccount(client, { address: address.vitalik }),
  ).resolves.toBeUndefined()

  await expect(
    sendTransaction(client, {
      account: address.vitalik,
      to: accounts[0].address,
      value: parseEther('1'),
    }),
  ).rejects.toThrowError('No Signer available')
})
