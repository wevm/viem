import { expect, test } from 'vitest'

import * as wallet from './wallet'

test('exports wallet actions', () => {
  expect(Object.keys(wallet)).toMatchInlineSnapshot(`
    [
      "addChain",
      "getAccounts",
      "getPermissions",
      "requestAccounts",
      "requestPermissions",
      "sendTransaction",
      "signMessage",
      "switchChain",
      "watchAsset",
    ]
  `)
})
