import { expect, test } from 'vitest'
import { accounts, walletClient } from '../../_test/index.js'
import { signMessage } from '../../actions/index.js'

import { verifyMessage } from './verifyMessage.js'

test('default', async () => {
  let signature = await signMessage(walletClient!, {
    account: accounts[0].address,
    message: 'hello world',
  })
  expect(
    await verifyMessage({
      address: accounts[0].address,
      message: 'hello world',
      signature,
    }),
  ).toBeTruthy()

  signature = await signMessage(walletClient!, {
    account: accounts[0].address,
    message: 'wagmi 🥵',
  })
  expect(
    await verifyMessage({
      address: accounts[0].address,
      message: 'wagmi 🥵',
      signature,
    }),
  ).toBeTruthy()
})
