import { describe, expect, test } from 'vitest'

import { accounts } from '~test/src/constants.js'

import { toAccount } from './toAccount.js'

describe('toAccount', () => {
  test('json-rpc account', () => {
    expect(toAccount(accounts[0].address)).toMatchInlineSnapshot(`
      {
        "address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "type": "json-rpc",
      }
    `)
  })

  test('json-rpc account (invalid address)', () => {
    expect(() => toAccount('0x1')).toThrowErrorMatchingInlineSnapshot(`
      [InvalidAddressError: Address "0x1" is invalid.

      - Address must be a hex value of 20 bytes (40 hex characters).
      - Address must match its checksum counterpart.

      Version: viem@x.y.z]
    `)
  })

  test('local account', () => {
    expect(
      toAccount({
        address: accounts[0].address,
        async signMessage() {
          return '0x'
        },
        async signTransaction(_transaction) {
          return '0x'
        },
        async signTypedData() {
          return '0x'
        },
      }),
    ).toMatchInlineSnapshot(`
      {
        "address": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "experimental_signAuthorization": undefined,
        "nonceManager": undefined,
        "sign": undefined,
        "signMessage": [Function],
        "signTransaction": [Function],
        "signTypedData": [Function],
        "source": "custom",
        "type": "local",
      }
    `)
  })

  test('local account (invalid address)', () => {
    expect(() =>
      toAccount({
        address: '0x1',
        async signMessage() {
          return '0x'
        },
        async signTransaction(_transaction) {
          return '0x'
        },
        async signTypedData() {
          return '0x'
        },
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidAddressError: Address "0x1" is invalid.

      - Address must be a hex value of 20 bytes (40 hex characters).
      - Address must match its checksum counterpart.

      Version: viem@x.y.z]
    `)
  })
})
