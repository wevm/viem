import { expect, test } from 'vitest'

import { walletProvider } from '../../../test/utils'

import { getProviderAccount } from './getProviderAccount'

test('creates signer', async () => {
  expect(
    getProviderAccount(walletProvider!, {
      address: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac',
    }),
  ).toMatchInlineSnapshot(`
    {
      "address": "0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac",
      "request": [Function],
      "type": "providerAccount",
    }
  `)
})
