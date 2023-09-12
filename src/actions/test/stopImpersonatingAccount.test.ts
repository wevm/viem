import { expect, test } from 'vitest'

import { accounts, address } from '~test/src/constants.js'
import { testClient, walletClient } from '~test/src/utils.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { sendTransaction } from '../wallet/sendTransaction.js'

import { impersonateAccount } from './impersonateAccount.js'
import { stopImpersonatingAccount } from './stopImpersonatingAccount.js'

test('stops impersonating account', async () => {
  await impersonateAccount(testClient, { address: address.vitalik })

  expect(
    await sendTransaction(walletClient, {
      account: address.vitalik,
      to: accounts[0].address,
      value: parseEther('1'),
    }),
  ).toBeDefined()

  await expect(
    stopImpersonatingAccount(testClient, { address: address.vitalik }),
  ).resolves.toBeUndefined()

  await expect(
    sendTransaction(walletClient, {
      account: address.vitalik,
      to: accounts[0].address,
      value: parseEther('1'),
    }),
  ).rejects.toThrowError('No Signer available')
})
