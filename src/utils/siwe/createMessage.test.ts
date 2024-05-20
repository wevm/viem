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

test('parameters: scheme', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(Date.UTC(2023, 1, 1)))

  expect(
    createMessage({
      ...message,
      scheme: 'https',
    }),
  ).toMatchInlineSnapshot(`
    "https://example.com wants you to sign in with your Ethereum account:
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

test('parameters: expirationTime', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(Date.UTC(2023, 1, 1)))

  expect(
    createMessage({
      ...message,
      expirationTime: new Date(Date.UTC(2022, 1, 4)).toISOString(),
    }),
  ).toMatchInlineSnapshot(`
    "example.com wants you to sign in with your Ethereum account:
    0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

    URI: https://example.com/path
    Version: 1
    Chain ID: 1
    Nonce: foobarbaz
    Issued At: 2023-02-01T00:00:00.000Z
    Expiration Time: 2022-02-04T00:00:00.000Z"
  `)

  vi.useRealTimers()
})

test('parameters: notBefore', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(Date.UTC(2023, 1, 1)))

  expect(
    createMessage({
      ...message,
      notBefore: new Date(Date.UTC(2022, 1, 4)).toISOString(),
    }),
  ).toMatchInlineSnapshot(`
    "example.com wants you to sign in with your Ethereum account:
    0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

    URI: https://example.com/path
    Version: 1
    Chain ID: 1
    Nonce: foobarbaz
    Issued At: 2023-02-01T00:00:00.000Z
    Not Before: 2022-02-04T00:00:00.000Z"
  `)

  vi.useRealTimers()
})

test('parameters: requestId', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(Date.UTC(2023, 1, 1)))

  expect(
    createMessage({
      ...message,
      requestId: '123e4567-e89b-12d3-a456-426614174000',
    }),
  ).toMatchInlineSnapshot(`
    "example.com wants you to sign in with your Ethereum account:
    0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

    URI: https://example.com/path
    Version: 1
    Chain ID: 1
    Nonce: foobarbaz
    Issued At: 2023-02-01T00:00:00.000Z
    Request ID: 123e4567-e89b-12d3-a456-426614174000"
  `)

  vi.useRealTimers()
})

test('parameters: resources', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(Date.UTC(2023, 1, 1)))

  expect(
    createMessage({
      ...message,
      resources: [
        'https://example.com/foo',
        'https://example.com/bar',
        'https://example.com/baz',
      ],
    }),
  ).toMatchInlineSnapshot(`
    "example.com wants you to sign in with your Ethereum account:
    0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

    URI: https://example.com/path
    Version: 1
    Chain ID: 1
    Nonce: foobarbaz
    Issued At: 2023-02-01T00:00:00.000Z
    Resources:
    - https://example.com/foo
    - https://example.com/bar
    - https://example.com/baz"
  `)

  vi.useRealTimers()
})

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

test('behavior: invalid chainId', () => {
  expect(() =>
    createMessage({ ...message, chainId: 1.1 }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [SiweInvalidMessageFieldError: Invalid Sign-In with Ethereum message field "chainId".

    - Chain ID must be a EIP-155 chain ID.
    - See https://eips.ethereum.org/EIPS/eip-155

    Provided value: 1.1

    Version: viem@1.0.2]
  `)
})

test('behavior: invalid domain', () => {
  expect(() =>
    createMessage({ ...message, domain: '#foo' }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [SiweInvalidMessageFieldError: Invalid Sign-In with Ethereum message field "domain".

    - Domain must be an RFC 3986 authority.
    - See https://www.rfc-editor.org/rfc/rfc3986

    Provided value: #foo

    Version: viem@1.0.2]
  `)
})

test('behavior: invalid nonce', () => {
  expect(() =>
    createMessage({ ...message, nonce: '#foo' }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [SiweInvalidMessageFieldError: Invalid Sign-In with Ethereum message field "nonce".

    - Nonce must be at least 8 characters.
    - Nonce must be alphanumeric.

    Provided value: #foo

    Version: viem@1.0.2]
  `)
})

test('behavior: invalid uri', () => {
  expect(() =>
    createMessage({ ...message, uri: '#foo' }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [SiweInvalidMessageFieldError: Invalid Sign-In with Ethereum message field "uri".

    - URI must be a RFC 3986 URI referring to the resource that is the subject of the signing.
    - See https://www.rfc-editor.org/rfc/rfc3986

    Provided value: #foo

    Version: viem@1.0.2]
  `)
})

test('behavior: invalid version', () => {
  expect(() =>
    // @ts-expect-error
    createMessage({ ...message, version: '2' }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [SiweInvalidMessageFieldError: Invalid Sign-In with Ethereum message field "version".

    - Version must be '1'.

    Provided value: 2

    Version: viem@1.0.2]
  `)
})

test('behavior: invalid scheme', () => {
  expect(() =>
    createMessage({ ...message, scheme: 'foo_bar' }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [SiweInvalidMessageFieldError: Invalid Sign-In with Ethereum message field "scheme".

    - Scheme must be an RFC 3986 URI scheme.
    - See https://www.rfc-editor.org/rfc/rfc3986#section-3.1

    Provided value: foo_bar

    Version: viem@1.0.2]
  `)
})

test('behavior: invalid issuedAt', () => {
  expect(() =>
    createMessage({ ...message, issuedAt: '01/04/2022' }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [SiweInvalidMessageFieldError: Invalid Sign-In with Ethereum message field "issuedAt".

    - Issued At must be an ISO 8601 datetime string.
    - See https://www.iso.org/iso-8601-date-and-time-format.html

    Provided value: 01/04/2022

    Version: viem@1.0.2]
  `)
})

test('behavior: invalid expirationTime', () => {
  expect(() =>
    createMessage({ ...message, expirationTime: '01/04/2022' }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [SiweInvalidMessageFieldError: Invalid Sign-In with Ethereum message field "expirationTime".

    - Expiration Time must be an ISO 8601 datetime string.
    - See https://www.iso.org/iso-8601-date-and-time-format.html

    Provided value: 01/04/2022

    Version: viem@1.0.2]
  `)
})

test('behavior: invalid notBefore', () => {
  expect(() =>
    createMessage({ ...message, notBefore: '01/04/2022' }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [SiweInvalidMessageFieldError: Invalid Sign-In with Ethereum message field "notBefore".

    - Not Before must be an ISO 8601 datetime string.
    - See https://www.iso.org/iso-8601-date-and-time-format.html

    Provided value: 01/04/2022

    Version: viem@1.0.2]
  `)
})

test('behavior: invalid statement', () => {
  expect(() =>
    createMessage({ ...message, statement: 'foo\nbar' }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [SiweInvalidMessageFieldError: Invalid Sign-In with Ethereum message field "statement".

    - Statement must not include '\\n'.

    Provided value: foo
    bar

    Version: viem@1.0.2]
  `)
})

test('behavior: invalid resources', () => {
  expect(() =>
    createMessage({ ...message, resources: ['https://example.com', 'foo'] }),
  ).toThrowErrorMatchingInlineSnapshot(`
    [SiweInvalidMessageFieldError: Invalid Sign-In with Ethereum message field "resources".

    - Every resource must be a RFC 3986 URI.
    - See https://www.rfc-editor.org/rfc/rfc3986

    Provided value: foo

    Version: viem@1.0.2]
  `)
})

