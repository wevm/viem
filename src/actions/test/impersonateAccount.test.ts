import { expect, test } from 'vitest'

import { accounts, address, testClient, walletClient } from '../../_test.js'
import { getAccount, parseEther } from '../../utils/index.js'
import { sendTransaction } from '../wallet/sendTransaction.js'
import { impersonateAccount } from './impersonateAccount.js'

test('impersonates account', async () => {
  await expect(
    sendTransaction(walletClient, {
      account: getAccount(address.vitalik),
      to: accounts[0].address,
      value: parseEther('1'),
    }),
  ).rejects.toThrowError('No Signer available')

  await impersonateAccount(testClient, { address: address.vitalik })

  expect(
    await sendTransaction(walletClient, {
      account: getAccount(address.vitalik),
      to: accounts[0].address,
      value: parseEther('1'),
    }),
  ).toBeDefined()
})
