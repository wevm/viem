import { expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { privateKeyToAccount } from '../privateKeyToAccount.js'

import { parseAccount } from './parseAccount.js'

test('address', () => {
  expect(
    parseAccount('0x0000000000000000000000000000000000000000'),
  ).toMatchInlineSnapshot(`
      {
        "address": "0x0000000000000000000000000000000000000000",
        "type": "json-rpc",
      }
    `)
})

test('account', () => {
  expect(
    parseAccount(privateKeyToAccount(accounts[0].privateKey)),
  ).toMatchInlineSnapshot(`
    {
      "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "experimental_signAuthorization": [Function],
      "nonceManager": undefined,
      "publicKey": "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5",
      "sign": [Function],
      "signMessage": [Function],
      "signTransaction": [Function],
      "signTypedData": [Function],
      "source": "privateKey",
      "type": "local",
    }
  `)
})
