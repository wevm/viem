import { expect, test } from 'vitest'
import { accounts, getLocalAccount } from '../../_test'
import { parseAccount } from './parseAccount'

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
    parseAccount(getLocalAccount(accounts[0].privateKey)),
  ).toMatchInlineSnapshot(`
    {
      "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "signMessage": [Function],
      "signTransaction": [Function],
      "signTypedData": [Function],
      "source": "custom",
      "type": "local",
    }
  `)
})
