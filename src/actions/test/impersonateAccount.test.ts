import { expect, test } from 'vitest'

import { accounts, address, testClient, walletClient } from '../../_test'
import { getAccount, parseEther } from '../../utils'
import { sendTransaction } from '../wallet/sendTransaction'
import { impersonateAccount } from './impersonateAccount'

test('impersonates account', async () => {
  await expect(
    sendTransaction(walletClient, {
      account: address.vitalik,
      to: accounts[0].address,
      value: parseEther('1'),
    }),
  ).rejects.toThrowError('No Signer available')

  await impersonateAccount(testClient, { address: address.vitalik })

  expect(
    await sendTransaction(walletClient, {
      account: address.vitalik,
      to: accounts[0].address,
      value: parseEther('1'),
    }),
  ).toBeDefined()
})
