import { expect, test } from 'vitest'

import {
  accounts,
  testClient,
  vitalikAddress,
  walletClient,
} from '../../../test'
import { parseEther } from '../../utils'
import { sendTransaction } from '../wallet/sendTransaction'
import { impersonateAccount } from './impersonateAccount'

const account = vitalikAddress

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
