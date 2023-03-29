import { expect, test } from 'vitest'

import * as utils from './index'

test('exports utils', () => {
  expect(Object.keys(utils)).toMatchInlineSnapshot(`
    [
      "HDKey",
      "generateMnemonic",
      "generatePrivateKey",
      "privateKeyToAccount",
      "toAccount",
      "parseAccount",
      "publicKeyToAddress",
      "signMessage",
      "signTypedData",
      "czech",
      "english",
      "french",
      "italian",
      "japanese",
      "korean",
      "simplifiedChinese",
      "spanish",
      "traditionalChinese",
    ]
  `)
})
