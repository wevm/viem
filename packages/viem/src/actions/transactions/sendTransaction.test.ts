import { expect, test } from 'vitest'

import {
  accountAddress,
  accountProvider,
  networkProvider,
  walletProvider,
} from '../../../test/utils'

import { sendTransaction } from './sendTransaction'

test('sends transaction', async () => {
  expect(
    (
      await sendTransaction(accountProvider, {
        request: { from: accountAddress, to: accountAddress, value: '0x0' },
      })
    ).hash,
  ).toBeDefined()
})
// eslint-disable-next-line prettier/prettier

;[walletProvider, networkProvider].forEach((provider) => {
  test(`errors when not an accountProvider (${provider!.id})`, async () => {
    await expect(
      // @ts-expect-error – testing for JS consumers
      sendTransaction(provider!, {
        request: { from: accountAddress, to: accountAddress, value: '0x0' },
      }),
    ).rejects.toThrow(`Invalid provider of type "${provider?.type}" provided`)
  })
})
