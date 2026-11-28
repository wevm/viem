import { expect, test } from 'vitest'

import { isUri } from './utils.js'

test('isUri - default', () => {
  expect(isUri('https://example.com/foo')).toMatchInlineSnapshot(
    `"https://example.com/foo"`,
  )
})

test('isUri - behavior: check for illegal characters', () => {
  expect(isUri('^')).toBeFalsy()
})

test('isUri - incomplete hex escapes', () => {
  expect(isUri('%$#')).toBeFalsy()
  expect(isUri('%0:#')).toBeFalsy()
})

test('isUri - missing scheme', () => {
  expect(isUri('example.com/foo')).toBeFalsy()
})

test('isUri - authority with missing path', () => {
  expect(isUri('1http:////foo.html')).toBeFalsy()
})

test('isUri - scheme begins with letter', () => {
  expect(isUri('$https://example.com/foo')).toBeFalsy()
})

test('isUri - IP-literal host', () => {
  const uris = [
    'uri://[::cafe]/p',
    'uri://[2001:db8::1]:8080',
    'uri://[1:2:3:4:5:6:7::]',
    'uri://[::ffff:000.000.010.001]',
    'uri://user@[v1.fe:x]',
    'uri://[::0.0.0.256]/p',
    'uri://[::.0.255.0]',
    'uri://[1:2:3:4:5:6:7:8::]',
    'uri://[1:2:3:4:5:6:7]',
    'uri://[1:2:3:4:5:6:7:8:9]',
    'uri://[1::2::3]',
    'uri://[::cafe',
  ]

  expect(
    Object.fromEntries(uris.map((uri) => [uri, Boolean(isUri(uri))])),
  ).toMatchInlineSnapshot(`
    {
      "uri://[1:2:3:4:5:6:7:8:9]": false,
      "uri://[1:2:3:4:5:6:7:8::]": false,
      "uri://[1:2:3:4:5:6:7::]": true,
      "uri://[1:2:3:4:5:6:7]": false,
      "uri://[1::2::3]": false,
      "uri://[2001:db8::1]:8080": true,
      "uri://[::.0.255.0]": false,
      "uri://[::0.0.0.256]/p": false,
      "uri://[::cafe": false,
      "uri://[::cafe]/p": true,
      "uri://[::ffff:000.000.010.001]": true,
      "uri://user@[v1.fe:x]": true,
    }
  `)
})

test('isUri - query', () => {
  expect(isUri('https://example.com/foo?bar')).toMatchInlineSnapshot(
    `"https://example.com/foo?bar"`,
  )
})

test('isUri - fragment', () => {
  expect(isUri('https://example.com/foo#bar')).toMatchInlineSnapshot(
    `"https://example.com/foo#bar"`,
  )
})
