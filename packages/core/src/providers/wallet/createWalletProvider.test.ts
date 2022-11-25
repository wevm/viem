import { expect, test } from 'vitest'

import { createWalletProvider } from './createWalletProvider'

test('creates', () => {
  const { uid, ...provider } = createWalletProvider({
    key: 'wallet',
    name: 'Wallet',
    on: <any>(async () => null),
    removeListener: <any>(async () => null),
    request: <any>(async () => null),
  })
  expect(uid).toBeDefined()
  expect(provider).toMatchInlineSnapshot(`
    {
      "key": "wallet",
      "name": "Wallet",
      "on": [Function],
      "pollingInterval": 4000,
      "removeListener": [Function],
      "request": [Function],
      "type": "walletProvider",
    }
  `)
})
