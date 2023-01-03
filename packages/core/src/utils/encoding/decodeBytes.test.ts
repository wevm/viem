import { expect, test } from 'vitest'

import { bytesToHex, bytesToString, decodeBytes } from './decodeBytes'

test('converts bytes to string', () => {
  expect(decodeBytes(new Uint8Array([]), 'string')).toMatchInlineSnapshot(`""`)
  expect(decodeBytes(new Uint8Array([97]), 'string')).toMatchInlineSnapshot(
    `"a"`,
  )
  expect(
    decodeBytes(new Uint8Array([97, 98, 99]), 'string'),
  ).toMatchInlineSnapshot(`"abc"`)
  expect(
    decodeBytes(
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
      'string',
    ),
  ).toMatchInlineSnapshot(`"Hello World!"`)

  expect(bytesToString(new Uint8Array([]))).toMatchInlineSnapshot(`""`)
  expect(bytesToString(new Uint8Array([97]))).toMatchInlineSnapshot(`"a"`)
  expect(bytesToString(new Uint8Array([97, 98, 99]))).toMatchInlineSnapshot(
    `"abc"`,
  )
  expect(
    bytesToString(
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
    ),
  ).toMatchInlineSnapshot(`"Hello World!"`)
})

test('converts bytes to hex', () => {
  expect(
    decodeBytes(new Uint8Array([97, 98, 99]), 'hex'),
  ).toMatchInlineSnapshot('"0x616263"')
  expect(decodeBytes(new Uint8Array([97]), 'hex')).toMatchInlineSnapshot(
    '"0x61"',
  )
  expect(
    decodeBytes(new Uint8Array([97, 98, 99]), 'hex'),
  ).toMatchInlineSnapshot('"0x616263"')
  expect(
    decodeBytes(
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
      'hex',
    ),
  ).toMatchInlineSnapshot('"0x48656c6c6f20576f726c6421"')

  expect(bytesToHex(new Uint8Array([97, 98, 99]))).toMatchInlineSnapshot(
    '"0x616263"',
  )
  expect(bytesToHex(new Uint8Array([97]))).toMatchInlineSnapshot('"0x61"')
  expect(bytesToHex(new Uint8Array([97, 98, 99]))).toMatchInlineSnapshot(
    '"0x616263"',
  )
  expect(
    bytesToHex(
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
    ),
  ).toMatchInlineSnapshot('"0x48656c6c6f20576f726c6421"')
})
