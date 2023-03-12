import { expect, test } from 'vitest'
import { getAccount, hashMessage } from '../../utils'
import { accounts, walletClient } from '../../_test'

import { signMessage } from './signMessage'
import { verifyMessage } from './verifyMessage'
import { Hex } from '../../types'

test('sign message', async () => {
  const data = 'hello world'
  const signature = await signMessage(walletClient!, {
    account: getAccount(accounts[0].address),
    data: data,
  })
  expect(
    verifyMessage({
      address: accounts[0].address,
      messageHash: hashMessage(data) as Hex,
      signature: signature,
    }),
  ).toBeTruthy()
})
