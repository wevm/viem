import { accounts } from '../../_test/constants.js'
import { walletClient } from '../../_test/utils.js'
import { signMessage } from '../../actions/wallet/signMessage.js'
import { verifyMessage } from './verifyMessage.js'
import { expect, test } from 'vitest'

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
