import { expect, test } from 'vitest'

import {
  accountProvider,
  accounts,
  networkProvider,
  testProvider,
  walletProvider,
} from '../../../test/utils'
import { numberToHex } from '../../utils'
import { fetchBalance } from '../public/fetchBalance'

import { sendTransaction } from './sendTransaction'

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

test('sends transaction', async () => {
  await testProvider.request({
    method: 'anvil_setBalance',
    params: [targetAccount.address, numberToHex(targetAccount.balance)],
  })
  await testProvider.request({
    method: 'anvil_setBalance',
    params: [sourceAccount.address, numberToHex(sourceAccount.balance)],
  })

  expect(
    (
      await sendTransaction(accountProvider, {
        request: {
          from: sourceAccount.address,
          to: targetAccount.address,
          value: numberToHex(1000000000000000n),
        },
      })
    ).hash,
  ).toBeDefined()
  expect(
    await fetchBalance(networkProvider, { address: targetAccount.address }),
  ).toMatchInlineSnapshot('10000001000000000000000n')
  expect(
    await fetchBalance(networkProvider, { address: sourceAccount.address }),
  ).toBeLessThan(sourceAccount.balance)
})
// eslint-disable-next-line prettier/prettier
;[walletProvider, networkProvider].forEach((provider) => {
  test(`errors when not an accountProvider (${provider!.id})`, async () => {
    await expect(
      // @ts-expect-error – testing for JS consumers
      sendTransaction(provider!, {
        request: {
          from: sourceAccount.address,
          to: targetAccount.address,
          value: numberToHex(1000000000000000n),
        },
      }),
    ).rejects.toThrow(`Invalid provider of type "${provider?.type}" provided`)
  })
})
