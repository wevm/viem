import { expect, test } from 'vitest'

import { accounts, testClient, walletClient } from '../../../test'
import { parseEther } from '../../utils'
import { sendTransaction } from '../transaction'
import { impersonateAccount } from './impersonateAccount'

const account = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'

test('impersonates account', async () => {
  await expect(
    sendTransaction(walletClient, {
      request: {
        from: account,
        to: accounts[0].address,
        value: parseEther('1'),
      },
    }),
  ).rejects.toThrowError('No Signer available')

  await impersonateAccount(testClient, { address: account })

  expect(
    await sendTransaction(walletClient, {
      request: {
        from: account,
        to: accounts[0].address,
        value: parseEther('1'),
      },
    }),
  ).toBeDefined()
})
