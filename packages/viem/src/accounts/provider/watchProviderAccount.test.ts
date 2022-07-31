import { expect, test } from 'vitest'

import { walletProvider } from '../../../test/utils'

import { watchProviderAccount } from './watchProviderAccount'
test('watches provider account', async () => {
  watchProviderAccount(walletProvider!, ({ providerAccount }) => {
    expect(providerAccount).toMatchInlineSnapshot(`
      {
        "address": "0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac",
        "request": [Function],
      }
    `)
  })
})
