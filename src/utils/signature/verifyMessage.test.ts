import { expect, test } from 'vitest'
import { accounts, walletClient } from '../../_test.js'
import { signMessage } from '../../actions/index.js'
import { getAccount } from '../../utils/index.js'

import { verifyMessage } from './verifyMessage.js'

test('default', async () => {
  let signature = await signMessage(walletClient!, {
    account: getAccount(accounts[0].address),
    message: 'hello world',
  })
  expect(
    verifyMessage({
      address: accounts[0].address,
      message: 'hello world',
      signature,
    }),
  ).toBeTruthy()

  signature = await signMessage(walletClient!, {
    account: getAccount(accounts[0].address),
    message: 'wagmi 🥵',
  })
  expect(
    verifyMessage({
      address: accounts[0].address,
      message: 'wagmi 🥵',
      signature,
    }),
  ).toBeTruthy()
})
