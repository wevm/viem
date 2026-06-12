import { expect, test } from 'vitest'

import * as viem from './index.js'

test('exports', () => {
  expect(Object.keys(viem)).toMatchInlineSnapshot(`
    [
      "Errors",
      "Abi",
      "AbiConstructor",
      "AbiError",
      "AbiEvent",
      "AbiFunction",
      "AbiItem",
      "AbiParameters",
      "Address",
      "Authorization",
      "BlobCells",
      "Blobs",
      "Bytes",
      "ContractAddress",
      "Ens",
      "Hash",
      "Hex",
      "Kzg",
      "PersonalMessage",
      "PublicKey",
      "Rlp",
      "Secp256k1",
      "Signature",
      "SignatureErc6492",
      "SignatureErc8010",
      "Siwe",
      "TypedData",
      "Value",
    ]
  `)
})
