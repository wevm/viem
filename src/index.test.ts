import { expect, test } from 'vitest'

import * as viem from './index.js'

test('exports', () => {
  expect(Object.keys(viem)).toMatchInlineSnapshot(`
    [
      "Errors",
      "AbiEvent",
      "AbiFunction",
      "AbiItem",
      "Address",
      "Bytes",
      "ContractAddress",
      "Hash",
      "Hex",
      "PersonalMessage",
      "PublicKey",
      "Rlp",
      "Secp256k1",
      "Signature",
      "SignatureErc6492",
      "SignatureErc8010",
      "TypedData",
      "Value",
    ]
  `)
})
