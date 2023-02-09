import { expect, test } from 'vitest'

import { address, accounts, testClient, walletClient } from '../../_test'
import { parseEther } from '../../utils'
import { sendTransaction } from '../wallet/sendTransaction'
import { impersonateAccount } from './impersonateAccount'
import { stopImpersonatingAccount } from './stopImpersonatingAccount'

test('stops impersonating account', async () => {
  await impersonateAccount(testClient, { address: address.vitalik })

  expect(
    await sendTransaction(walletClient, {
      from: address.vitalik,
      to: accounts[0].address,
      value: parseEther('1'),
    }),
  ).toBeDefined()

  await stopImpersonatingAccount(testClient, { address: address.vitalik })

  await expect(
    sendTransaction(walletClient, {
      from: address.vitalik,
      to: accounts[0].address,
      value: parseEther('1'),
    }),
  ).rejects.toThrowError('No Signer available')
})
