import { expect, test } from 'vitest'

import { accounts, address } from '~test/src/constants.js'
import { testClient, walletClient } from '~test/src/utils.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { sendTransaction } from '../wallet/sendTransaction.js'

import { impersonateAccount } from './impersonateAccount.js'
import { stopImpersonatingAccount } from './stopImpersonatingAccount.js'

test('impersonates account', async () => {
  await expect(
    sendTransaction(walletClient, {
      account: address.vitalik,
      to: accounts[0].address,
      value: parseEther('1'),
    }),
  ).rejects.toThrowError('No Signer available')

  await expect(
    impersonateAccount(testClient, { address: address.vitalik }),
  ).resolves.toBeUndefined()

  expect(
    await sendTransaction(walletClient, {
      account: address.vitalik,
      to: accounts[0].address,
      value: parseEther('1'),
    }),
  ).toBeDefined()

  await stopImpersonatingAccount(testClient, { address: address.vitalik })
})
