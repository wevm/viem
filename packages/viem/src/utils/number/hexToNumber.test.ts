import { expect, test } from 'vitest'

import { hexToNumber } from './hexToNumber'

test('converts hex to number', () => {
  expect(hexToNumber('0x0')).toMatchInlineSnapshot('0')
  expect(hexToNumber('0x7')).toMatchInlineSnapshot('7')
  expect(hexToNumber('0x45')).toMatchInlineSnapshot('69')
  expect(hexToNumber('0x1a4')).toMatchInlineSnapshot('420')
})
