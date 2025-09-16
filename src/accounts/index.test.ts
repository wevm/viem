import { expect, test } from 'vitest'

import * as utils from './index.js'

test('exports utils', () => {
  expect(Object.keys(utils)).toMatchInlineSnapshot(`
    [
      "HDKey",
      "createNonceManager",
      "nonceManager",
      "signatureToHex",
      "serializeSignature",
      "generateMnemonic",
      "generatePrivateKey",
      "hdKeyToAccount",
      "mnemonicToAccount",
      "privateKeyToAccount",
      "toAccount",
      "parseAccount",
      "privateKeyToAddress",
      "publicKeyToAddress",
      "setSignEntropy",
      "sign",
      "signAuthorization",
      "signMessage",
      "signTransaction",
      "signTypedData",
      "czech",
      "english",
      "french",
      "italian",
      "japanese",
      "korean",
      "portuguese",
      "simplifiedChinese",
      "spanish",
      "traditionalChinese",
    ]
  `)
})
