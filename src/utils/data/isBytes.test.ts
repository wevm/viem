import { expect, test } from 'vitest'

import { isBytes } from './isBytes'

test('is bytes', () => {
  expect(isBytes(new Uint8Array([1, 69, 420])))
  expect(isBytes('0x1')).toBeFalsy()
  expect(isBytes({})).toBeFalsy()
  expect(isBytes(undefined)).toBeFalsy()
})
