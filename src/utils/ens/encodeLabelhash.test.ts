import { expect, test } from 'vitest'
import type { Hex } from '../../index.js'
import { encodeLabelhash } from './encodeLabelhash.js'

test.each([
  {
    hash: '0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658',
    expected:
      '[9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658]',
  },
  {
    hash: '0x4f5b812789fc606be1b3b16908db13fc7a9adf7ca72641f84d75b47069d3d7f0',
    expected:
      '[4f5b812789fc606be1b3b16908db13fc7a9adf7ca72641f84d75b47069d3d7f0]',
  },
])(`encodeLabelhash('$hash') -> $expected`, ({ hash, expected }) => {
  expect(encodeLabelhash(hash as Hex)).toBe(expected)
})
