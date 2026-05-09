import { expect, test } from 'vitest'
import { encodedLabelToLabelhash } from './encodedLabelToLabelhash.js'

test.each([
  {
    label: '[9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658]',
    expected:
      '0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658',
  },
  {
    label: '[4f5b812789fc606be1b3b16908db13fc7a9adf7ca72641f84d75b47069d3d7f0]',
    expected:
      '0x4f5b812789fc606be1b3b16908db13fc7a9adf7ca72641f84d75b47069d3d7f0',
  },
  {
    label: '0x4f5b812789fc606be1b3b16908db13fc7a9adf7ca72641f84d75b47069d3d7f0',
    expected: null,
  },
  {
    label: `[${'z'.repeat(64)}]`,
    expected: null,
  },
  {
    label: 'test',
    expected: null,
  },
  {
    label: 'a[dfsdfd',
    expected: null,
  },
  {
    label: '[4f5b812789fc606be1b3b16908db13fc7a9adf7ca72641f84d75b47069d3d7f]0',
    expected: null,
  },
])(`encodedLabelToLabelhash('$label') -> $expected`, ({ label, expected }) => {
  expect(encodedLabelToLabelhash(label)).toBe(expected)
})
