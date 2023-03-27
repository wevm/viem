import { expect, test } from 'vitest'

import { address, accounts, testClient, walletClient } from '../../_test.js'
import { getAccount, parseEther } from '../../utils/index.js'
import { sendTransaction } from '../wallet/sendTransaction.js'
import { impersonateAccount } from './impersonateAccount.js'
import { stopImpersonatingAccount } from './stopImpersonatingAccount.js'

test('stops impersonating account', async () => {
  await impersonateAccount(testClient, { address: address.vitalik })

  expect(
    await sendTransaction(walletClient, {
      account: getAccount(address.vitalik),
      to: accounts[0].address,
      value: parseEther('1'),
    }),
  ).toBeDefined()

  await stopImpersonatingAccount(testClient, { address: address.vitalik })

  await expect(
    sendTransaction(walletClient, {
      account: getAccount(address.vitalik),
      to: accounts[0].address,
      value: parseEther('1'),
    }),
  ).rejects.toThrowError('No Signer available')
})
