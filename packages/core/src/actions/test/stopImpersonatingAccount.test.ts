import { expect, test } from 'vitest'

import { accounts, testClient, walletClient } from '../../../test'
import { parseEther } from '../../utils'
import { sendTransaction } from '../wallet/sendTransaction'
import { impersonateAccount } from './impersonateAccount'
import { stopImpersonatingAccount } from './stopImpersonatingAccount'

const account = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'

test('stops impersonating account', async () => {
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

  await stopImpersonatingAccount(testClient, { address: account })

  await expect(
    sendTransaction(walletClient, {
      request: {
        from: account,
        to: accounts[0].address,
        value: parseEther('1'),
      },
    }),
  ).rejects.toThrowError('No Signer available')
})
