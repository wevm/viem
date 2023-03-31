import { expect, test } from 'vitest'

import * as wallet from './wallet.js'

test('exports wallet actions', () => {
  expect(Object.keys(wallet)).toMatchInlineSnapshot(`
    [
      "addChain",
      "getAddresses",
      "getPermissions",
      "requestAddresses",
      "requestPermissions",
      "sendTransaction",
      "signMessage",
      "signTypedData",
      "switchChain",
      "watchAsset",
    ]
  `)
})
