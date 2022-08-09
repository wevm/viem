import { expect, test } from 'vitest'

import { numberToHex } from './numberToHex'

test('converts numbers to hex', () => {
  expect(numberToHex(0)).toMatchInlineSnapshot('"0x0"')
  expect(numberToHex(7)).toMatchInlineSnapshot('"0x7"')
  expect(numberToHex(69)).toMatchInlineSnapshot('"0x45"')
  expect(numberToHex(420)).toMatchInlineSnapshot('"0x1a4"')
})

test('converts bigints to hex', () => {
  expect(numberToHex(0)).toMatchInlineSnapshot('"0x0"')
  expect(numberToHex(7n)).toMatchInlineSnapshot('"0x7"')
  expect(numberToHex(69n)).toMatchInlineSnapshot('"0x45"')
  expect(numberToHex(420n)).toMatchInlineSnapshot('"0x1a4"')
  expect(
    numberToHex(4206942069420694206942069420694206942069n),
  ).toMatchInlineSnapshot('"0xc5cf39211876fb5e5884327fa56fc0b75"')
})
