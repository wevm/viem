import { expect, test, vi } from 'vitest'

import { mainnet } from '../../chains/definitions/mainnet.js'
import { createMessage } from './createMessage.js'
import type { Message } from './types.js'

const message = {
  address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
  chainId: mainnet.id,
  domain: 'example.com',
  nonce: 'foobarbaz',
  uri: 'https://example.com/path',
  version: '1',
} satisfies Message

test('default', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(Date.UTC(2023, 1, 1)))

  expect(createMessage(message)).toMatchInlineSnapshot(`
    "example.com wants you to sign in with your Ethereum account:
    0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

    URI: https://example.com/path
    Version: 1
    Chain ID: 1
    Nonce: foobarbaz
    Issued At: 2023-02-01T00:00:00.000Z"
  `)

  vi.useRealTimers()
})

test('parameters: statement', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(Date.UTC(2023, 1, 1)))

  expect(
    createMessage({
      ...message,
      statement:
        'I accept the ExampleOrg Terms of Service: https://example.com/tos',
    }),
  ).toMatchInlineSnapshot(`
    "example.com wants you to sign in with your Ethereum account:
    0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

    I accept the ExampleOrg Terms of Service: https://example.com/tos

    URI: https://example.com/path
    Version: 1
    Chain ID: 1
    Nonce: foobarbaz
    Issued At: 2023-02-01T00:00:00.000Z"
  `)

  vi.useRealTimers()
})

test('parameters: issuedAt', () => {
  const issuedAt = new Date(Date.UTC(2022, 1, 4)).toISOString()
  expect(createMessage({ ...message, issuedAt })).toMatchInlineSnapshot(`
    "example.com wants you to sign in with your Ethereum account:
    0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

    URI: https://example.com/path
    Version: 1
    Chain ID: 1
    Nonce: foobarbaz
    Issued At: 2022-02-04T00:00:00.000Z"
  `)
})

test.todo('parameters: expirationTime')
test.todo('parameters: notBefore')
test.todo('parameters: requestId')
test.todo('parameters: resources')

test('behavior: invalid address', () => {
  expect(() =>
    createMessage({ ...message, address: '0xfoobarbaz' }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [InvalidAddressError: Address "0xfoobarbaz" is invalid.

    - Address must be a hex value of 20 bytes (40 hex characters).
    - Address must match its checksum counterpart.

    Version: viem@1.0.2]
  `)
})

test('behavior: invalid domain', () => {
  expect(() =>
    createMessage({ ...message, domain: '#foo' }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [SwieInvalidDomainError: Invalid domain.
    Domain must be valid RFC 4501 DNS authority.

    Version: viem@1.0.2]
  `)
})

test('behavior: invalid nonce', () => {
  expect(() =>
    createMessage({ ...message, nonce: '#foo' }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [SwieInvalidNonceError: Invalid nonce.
    Nonce must be more 8 or more alphanumeric characters.

    Version: viem@1.0.2]
  `)
})

test('behavior: invalid uri', () => {
  expect(() =>
    createMessage({ ...message, uri: '#foo' }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [SwieInvalidUriError: Invalid URI.
    URI must be valid RFC 3986 URI referring to the resource that is the subject of the signing.

    Version: viem@1.0.2]
  `)
})

test('behavior: invalid version', () => {
  expect(() =>
    // @ts-expect-error
    createMessage({ ...message, version: '2' }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [SwieInvalidVersionError: Invalid version.
    Version must be '1'.

    Version: viem@1.0.2]
  `)
})

test('behavior: invalid issuedAt', () => {
  expect(() =>
    createMessage({ ...message, issuedAt: '01/04/2022' }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [SwieInvalidISO8601Error: Invalid ISO 8601 value.
    Value "01/04/2022" for name "issuedAt" is not a valid ISO 8601 date.

    Version: viem@1.0.2]
  `)
})

test.todo('behavior: invalid statement')

test('behavior: invalid expirationTime', () => {
  expect(() =>
    createMessage({ ...message, expirationTime: '01/04/2022' }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [SwieInvalidISO8601Error: Invalid ISO 8601 value.
    Value "01/04/2022" for name "expirationTime" is not a valid ISO 8601 date.

    Version: viem@1.0.2]
  `)
})

test('behavior: invalid notBefore', () => {
  expect(() =>
    createMessage({ ...message, notBefore: '01/04/2022' }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [SwieInvalidISO8601Error: Invalid ISO 8601 value.
    Value "01/04/2022" for name "notBefore" is not a valid ISO 8601 date.

    Version: viem@1.0.2]
  `)
})
