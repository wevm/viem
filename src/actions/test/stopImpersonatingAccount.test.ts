import { expect, test } from 'vitest'

import { accounts, testClient, vitalikAddress, walletClient } from '../../_test'
import { parseEther } from '../../utils'
import { sendTransaction } from '../wallet/sendTransaction'
import { impersonateAccount } from './impersonateAccount'
import { stopImpersonatingAccount } from './stopImpersonatingAccount'

const account = vitalikAddress

test('stops impersonating account', async () => {
  await impersonateAccount(testClient, { address: account })

  expect(
    await sendTransaction(walletClient, {
      from: account,
      to: accounts[0].address,
      value: parseEther('1'),
    }),
  ).toBeDefined()

  await stopImpersonatingAccount(testClient, { address: account })

  await expect(
    sendTransaction(walletClient, {
      from: account,
      to: accounts[0].address,
      value: parseEther('1'),
    }),
  ).rejects.toThrowError('No Signer available')
})
