import { expect, test } from 'vitest'

import * as utils from './index.js'

test('exports utils', () => {
  expect(Object.keys(utils)).toMatchInlineSnapshot(`
    [
      "HDKey",
      "generateMnemonic",
      "generatePrivateKey",
      "hdKeyToAccount",
      "mnemonicToAccount",
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
