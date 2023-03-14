import { expect, test } from 'vitest'
import { accounts, walletClient } from '../../_test'
import { signMessage } from '../../actions'
import { getAccount } from '../../utils'

import { verifyMessage } from './verifyMessage'

test('sign message', async () => {
  const message = 'hello world'
  const signature = await signMessage(walletClient!, {
    account: getAccount(accounts[0].address),
    message,
  })
  expect(
    verifyMessage({
      address: accounts[0].address,
      message,
      signature,
    }),
  ).toBeTruthy()
})
