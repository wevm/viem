import { expect, test } from 'vitest'

import { parseSiweMessage } from './parseSiweMessage.js'

test('default', () => {
  const message = `example.com wants you to sign in with your Ethereum account:
0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

I accept the ExampleOrg Terms of Service: https://example.com/tos

URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z`
  const parsed = parseSiweMessage(message)
  expect(parsed).toMatchInlineSnapshot(`
    {
      "address": "0xA0Cf798816D4b9b9866b5330EEa46a18382f251e",
      "chainId": 1,
      "domain": "example.com",
      "issuedAt": 2023-02-01T00:00:00.000Z,
      "nonce": "foobarbaz",
      "statement": "I accept the ExampleOrg Terms of Service: https://example.com/tos",
      "uri": "https://example.com/path",
      "version": "1",
    }
  `)
})

test('behavior: with scheme', () => {
  const message = `https://example.com wants you to sign in with your Ethereum account:
0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z`
  const parsed = parseSiweMessage(message)
  expect(parsed.scheme).toMatchInlineSnapshot(`"https"`)
})

test('behavior: scheme with a comma is not a scheme', () => {
  // `[a-zA-Z0-9+-.]` reads `+-.` as a range, which also matches `,`. RFC 3986 §3.1
  // allows only `+`, `-` and `.` after the leading letter, so this is not a scheme
  // and the prefix does not parse.
  const message = `ht,tps://example.com wants you to sign in with your Ethereum account:
0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z`
  const parsed = parseSiweMessage(message)
  expect(parsed.scheme).toBeUndefined()
  expect(parsed.domain).toBeUndefined()
})

test('behavior: schemes using the punctuation RFC 3986 does allow', () => {
  for (const scheme of ['https', 'a+b', 'a-b', 'a.b']) {
    const message = `${scheme}://example.com wants you to sign in with your Ethereum account:
0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z`
    expect(parseSiweMessage(message).scheme).toBe(scheme)
  }
})

test('behavior: domain with port', () => {
  const message = `example.com:8080 wants you to sign in with your Ethereum account:
0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z`
  const parsed = parseSiweMessage(message)
  expect(parsed.domain).toMatchInlineSnapshot(`"example.com:8080"`)
})

test('behavior: RFC 3986 authority domains', () => {
  // EIP-4361 `domain = authority`, which allows userinfo and IP-literal hosts.
  // An empty domain is not an authority, so the prefix does not parse.
  const domains = [
    'test@127.0.0.1',
    'test@127.0.0.1:8080',
    '[::cafe]',
    'https://[2001:db8::1]:8080',
    '',
  ]

  const parsed = domains.map((domain) => {
    const { address, domain: parsedDomain } =
      parseSiweMessage(`${domain} wants you to sign in with your Ethereum account:
0xA0Cf798816D4b9b9866b5330EEa46a18382f251e


URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z`)
    return { address, domain: parsedDomain }
  })

  expect(parsed).toMatchInlineSnapshot(`
    [
      {
        "address": "0xA0Cf798816D4b9b9866b5330EEa46a18382f251e",
        "domain": "test@127.0.0.1",
      },
      {
        "address": "0xA0Cf798816D4b9b9866b5330EEa46a18382f251e",
        "domain": "test@127.0.0.1:8080",
      },
      {
        "address": "0xA0Cf798816D4b9b9866b5330EEa46a18382f251e",
        "domain": "[::cafe]",
      },
      {
        "address": "0xA0Cf798816D4b9b9866b5330EEa46a18382f251e",
        "domain": "[2001:db8::1]:8080",
      },
      {
        "address": undefined,
        "domain": undefined,
      },
    ]
  `)
})

test('behavior: with statement', () => {
  const message = `example.com wants you to sign in with your Ethereum account:
0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

I accept the ExampleOrg Terms of Service: https://example.com/tos

URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z`
  const parsed = parseSiweMessage(message)
  expect(parsed.statement).toMatchInlineSnapshot(
    `"I accept the ExampleOrg Terms of Service: https://example.com/tos"`,
  )
})

test('behavior: statement with a line break', () => {
  // The statement must be one line, or the parsed fields omit text the user
  // signed. The last two cases end the statement with one line break instead
  // of a blank line.
  const statements = [
    'foo\nURI: https://evil.example\n',
    'foo\rURI: https://evil.example\n',
    'foo\u2028URI: https://evil.example\n',
    'foo\u2029URI: https://evil.example\n',
    'foo\n\nbar\n',
    'foo\u2028URI: https://evil.example',
    'foo\rURI: https://evil.example',
  ]

  const parsed = statements.map((statement) =>
    parseSiweMessage(`example.com wants you to sign in with your Ethereum account:
0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

${statement}
URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z`),
  )

  expect(parsed).toMatchInlineSnapshot(`
    [
      {},
      {},
      {},
      {},
      {},
      {},
      {},
    ]
  `)
})

test('behavior: empty statement', () => {
  // EIP-4361 allows an empty statement line (`[ statement LF ]`).
  const message = `example.com wants you to sign in with your Ethereum account:
0xA0Cf798816D4b9b9866b5330EEa46a18382f251e



URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z`
  const parsed = parseSiweMessage(message)
  expect(parsed.statement).toMatchInlineSnapshot(`""`)
})

test('behavior: text after the suffix', () => {
  // Out-of-order or unknown lines would otherwise be dropped from the parsed
  // fields, so a signed `Expiration Time` after `Not Before` was ignored.
  const suffixes = [
    'Not Before: 2022-03-17T12:45:13.610Z\nExpiration Time: 2023-03-17T12:45:13.610Z',
    'Resources:\n- https://example.com/foo\nRequest ID: some_id',
    'Request ID: some_id\nFoo: bar',
    'Request ID: some_id\n',
  ]

  const parsed = suffixes.map((suffix) =>
    parseSiweMessage(`example.com wants you to sign in with your Ethereum account:
0xA0Cf798816D4b9b9866b5330EEa46a18382f251e


URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2022-03-17T12:45:13.610Z
${suffix}`),
  )

  expect(parsed).toMatchInlineSnapshot(`
    [
      {},
      {},
      {},
      {},
    ]
  `)
})

test('behavior: with expirationTime', () => {
  const message = `https://example.com wants you to sign in with your Ethereum account:
0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z
Expiration Time: 2022-02-04T00:00:00.000Z`
  const parsed = parseSiweMessage(message)
  expect(parsed.expirationTime).toMatchInlineSnapshot(
    '2022-02-04T00:00:00.000Z',
  )
})

test('behavior: with notBefore', () => {
  const message = `https://example.com wants you to sign in with your Ethereum account:
0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z
Not Before: 2022-02-04T00:00:00.000Z`
  const parsed = parseSiweMessage(message)
  expect(parsed.notBefore).toMatchInlineSnapshot('2022-02-04T00:00:00.000Z')
})

test('behavior: non-RFC3339 expirationTime yields Invalid Date', () => {
  const message = `https://example.com wants you to sign in with your Ethereum account:
0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z
Expiration Time: never`
  const parsed = parseSiweMessage(message)
  expect(Number.isNaN(parsed.expirationTime?.getTime())).toBeTruthy()

  // RFC 3339 dates JS Date would roll over into another day.
  for (const expirationTime of [
    '2023-02-30T00:00:00Z',
    '2023-02-01T24:00:00Z',
    '2023-02-01T00:00:60Z',
  ]) {
    const { expirationTime: parsed } = parseSiweMessage(
      message.replace('never', expirationTime),
    )
    expect(Number.isNaN(parsed?.getTime())).toBeTruthy()
  }
})

test('behavior: with requestId', () => {
  const message = `https://example.com wants you to sign in with your Ethereum account:
0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z
Request ID: 123e4567-e89b-12d3-a456-426614174000`
  const parsed = parseSiweMessage(message)
  expect(parsed.requestId).toMatchInlineSnapshot(
    `"123e4567-e89b-12d3-a456-426614174000"`,
  )
})

test('behavior: with resources', () => {
  const message = `https://example.com wants you to sign in with your Ethereum account:
0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z
Resources:
- https://example.com/foo
- https://example.com/bar
- https://example.com/baz`
  const parsed = parseSiweMessage(message)
  expect(parsed.resources).toMatchInlineSnapshot(`
    [
      "https://example.com/foo",
      "https://example.com/bar",
      "https://example.com/baz",
    ]
  `)
})

test('behavior: "Resources:" in statement', () => {
  const message = `example.com wants you to sign in with your Ethereum account:
0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

See the Resources: list below.

URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z
Resources:
- https://example.com/foo
- https://example.com/bar`
  const parsed = parseSiweMessage(message)
  expect(parsed).toMatchInlineSnapshot(`
    {
      "address": "0xA0Cf798816D4b9b9866b5330EEa46a18382f251e",
      "chainId": 1,
      "domain": "example.com",
      "issuedAt": 2023-02-01T00:00:00.000Z,
      "nonce": "foobarbaz",
      "resources": [
        "https://example.com/foo",
        "https://example.com/bar",
      ],
      "statement": "See the Resources: list below.",
      "uri": "https://example.com/path",
      "version": "1",
    }
  `)
})

test('behavior: "Resources:" in statement without resources', () => {
  const message = `example.com wants you to sign in with your Ethereum account:
0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

See the Resources: page.

URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z`
  const parsed = parseSiweMessage(message)
  expect(parsed.resources).toBeUndefined()
})

test('behavior: "Resources:" in uri', () => {
  const message = `example.com wants you to sign in with your Ethereum account:
0xA0Cf798816D4b9b9866b5330EEa46a18382f251e


URI: https://example.com/Resources:path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z
Resources:
- https://example.com/foo`
  const parsed = parseSiweMessage(message)
  expect(parsed.resources).toMatchInlineSnapshot(`
    [
      "https://example.com/foo",
    ]
  `)
})

test('behavior: "Resources:" in requestId', () => {
  const message = `example.com wants you to sign in with your Ethereum account:
0xA0Cf798816D4b9b9866b5330EEa46a18382f251e


URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z
Request ID: Resources:123
Resources:
- https://example.com/foo`
  const parsed = parseSiweMessage(message)
  expect(parsed.resources).toMatchInlineSnapshot(`
    [
      "https://example.com/foo",
    ]
  `)
})

test('behavior: "Resources:" in a resource', () => {
  const message = `example.com wants you to sign in with your Ethereum account:
0xA0Cf798816D4b9b9866b5330EEa46a18382f251e


URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z
Resources:
- https://example.com/Resources:foo
- https://example.com/bar`
  const parsed = parseSiweMessage(message)
  expect(parsed.resources).toMatchInlineSnapshot(`
    [
      "https://example.com/Resources:foo",
      "https://example.com/bar",
    ]
  `)
})

test('behavior: empty requestId with resources', () => {
  // EIP-4361 allows an empty Request ID (`request-id = *pchar`).
  const message = `example.com wants you to sign in with your Ethereum account:
0xA0Cf798816D4b9b9866b5330EEa46a18382f251e


URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z
Request ID: \nResources:
- https://example.com/foo`
  const parsed = parseSiweMessage(message)
  expect(parsed.requestId).toMatchInlineSnapshot(`""`)
  expect(parsed.resources).toMatchInlineSnapshot(`
    [
      "https://example.com/foo",
    ]
  `)
})

test('behavior: no suffix', () => {
  const message = `https://example.com wants you to sign in with your Ethereum account:
0xA0Cf798816D4b9b9866b5330EEa46a18382f251e

`
  const parsed = parseSiweMessage(message)
  expect(parsed).toMatchInlineSnapshot(`
    {
      "address": "0xA0Cf798816D4b9b9866b5330EEa46a18382f251e",
      "domain": "example.com",
      "scheme": "https",
    }
  `)
})

test('behavior: no prefix', () => {
  const message = `URI: https://example.com/path
Version: 1
Chain ID: 1
Nonce: foobarbaz
Issued At: 2023-02-01T00:00:00.000Z
Request ID: 123e4567-e89b-12d3-a456-426614174000`
  const parsed = parseSiweMessage(message)
  expect(parsed).toMatchInlineSnapshot(`
    {
      "chainId": 1,
      "issuedAt": 2023-02-01T00:00:00.000Z,
      "nonce": "foobarbaz",
      "requestId": "123e4567-e89b-12d3-a456-426614174000",
      "uri": "https://example.com/path",
      "version": "1",
    }
  `)
})

test('behavior: bogus message', () => {
  const message = 'foobarbaz'
  const parsed = parseSiweMessage(message)
  expect(parsed).toMatchInlineSnapshot('{}')
})
