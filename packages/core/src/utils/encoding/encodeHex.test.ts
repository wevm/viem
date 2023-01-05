import { expect, test } from 'vitest'

import {
  boolToHex,
  bytesToHex,
  encodeHex,
  numberToHex,
  stringToHex,
} from './encodeHex'

test('converts numbers to hex', () => {
  expect(encodeHex(0)).toMatchInlineSnapshot('"0x0"')
  expect(encodeHex(7)).toMatchInlineSnapshot('"0x7"')
  expect(encodeHex(69)).toMatchInlineSnapshot('"0x45"')
  expect(encodeHex(420)).toMatchInlineSnapshot('"0x1a4"')

  expect(numberToHex(0)).toMatchInlineSnapshot('"0x0"')
  expect(numberToHex(7)).toMatchInlineSnapshot('"0x7"')
  expect(numberToHex(69)).toMatchInlineSnapshot('"0x45"')
  expect(numberToHex(420)).toMatchInlineSnapshot('"0x1a4"')

  expect(
    // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
    () => numberToHex(420182738912731283712937129),
  ).toThrowErrorMatchingInlineSnapshot(
    '"Number is not in safe integer range (0 to 9007199254740991)"',
  )
  expect(
    // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
    () => numberToHex(-69),
  ).toThrowErrorMatchingInlineSnapshot(
    '"Number is not in safe integer range (0 to 9007199254740991)"',
  )
})

test('converts bigints to hex', () => {
  expect(encodeHex(0)).toMatchInlineSnapshot('"0x0"')
  expect(encodeHex(7n)).toMatchInlineSnapshot('"0x7"')
  expect(encodeHex(69n)).toMatchInlineSnapshot('"0x45"')
  expect(encodeHex(420n)).toMatchInlineSnapshot('"0x1a4"')
  expect(
    encodeHex(4206942069420694206942069420694206942069n),
  ).toMatchInlineSnapshot('"0xc5cf39211876fb5e5884327fa56fc0b75"')

  expect(numberToHex(0)).toMatchInlineSnapshot('"0x0"')
  expect(numberToHex(7n)).toMatchInlineSnapshot('"0x7"')
  expect(numberToHex(69n)).toMatchInlineSnapshot('"0x45"')
  expect(numberToHex(420n)).toMatchInlineSnapshot('"0x1a4"')
  expect(
    numberToHex(4206942069420694206942069420694206942069n),
  ).toMatchInlineSnapshot('"0xc5cf39211876fb5e5884327fa56fc0b75"')

  expect(
    // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
    () => numberToHex(-69n),
  ).toThrowErrorMatchingInlineSnapshot(
    '"Number is not in safe integer range (0 to 9007199254740991)"',
  )
})

test('converts boolean to hex', () => {
  expect(encodeHex(true)).toMatchInlineSnapshot('"0x1"')
  expect(encodeHex(false)).toMatchInlineSnapshot('"0x0"')

  expect(boolToHex(true)).toMatchInlineSnapshot('"0x1"')
  expect(boolToHex(false)).toMatchInlineSnapshot('"0x0"')
})

test('converts string to hex', () => {
  expect(encodeHex('')).toMatchInlineSnapshot('"0x"')
  expect(encodeHex('a')).toMatchInlineSnapshot('"0x61"')
  expect(encodeHex('abc')).toMatchInlineSnapshot('"0x616263"')
  expect(encodeHex('Hello World!')).toMatchInlineSnapshot(
    '"0x48656c6c6f20576f726c6421"',
  )

  expect(stringToHex('')).toMatchInlineSnapshot('"0x"')
  expect(stringToHex('a')).toMatchInlineSnapshot('"0x61"')
  expect(stringToHex('abc')).toMatchInlineSnapshot('"0x616263"')
  expect(stringToHex('Hello World!')).toMatchInlineSnapshot(
    '"0x48656c6c6f20576f726c6421"',
  )
})

test('converts bytes to hex', () => {
  expect(encodeHex(new Uint8Array([]))).toMatchInlineSnapshot('"0x"')
  expect(encodeHex(new Uint8Array([97]))).toMatchInlineSnapshot('"0x61"')
  expect(encodeHex(new Uint8Array([97, 98, 99]))).toMatchInlineSnapshot(
    '"0x616263"',
  )
  expect(
    encodeHex(
      new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]),
    ),
  ).toMatchInlineSnapshot('"0x48656c6c6f20576f726c6421"')

  expect(bytesToHex(new Uint8Array([]))).toMatchInlineSnapshot('"0x"')
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
