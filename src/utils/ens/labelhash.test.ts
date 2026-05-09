import { expect, test } from 'vitest'

import { labelhash } from './labelhash.js'
import { normalize } from './normalize.js'

test.each([
  {
    label: '',
    expected:
      '0x0000000000000000000000000000000000000000000000000000000000000000',
  },
  {
    label: 'eth',
    expected:
      '0x4f5b812789fc606be1b3b16908db13fc7a9adf7ca72641f84d75b47069d3d7f0',
  },
  {
    label: 'awkweb',
    expected:
      '0x7aaad03ddcacc63166440f59c14a1a2c97ee381014b59c58f55b49ab05f31a38',
  },
  {
    label: normalize('awkw𝝣b'),
    expected:
      '0x064cfb20fc5f10bd727bd17232b9b0c8021cec89e596b1c966ff1c611420c72f',
  },
  {
    label: '\u{0061}wkweb',
    expected:
      '0x7aaad03ddcacc63166440f59c14a1a2c97ee381014b59c58f55b49ab05f31a38',
  },
  {
    label: '\u{0061}wkw\u{0065}b',
    expected:
      '0x7aaad03ddcacc63166440f59c14a1a2c97ee381014b59c58f55b49ab05f31a38',
  },
  {
    label: 'awkweb',
    //     ^ latin small "a"
    expected:
      '0x7aaad03ddcacc63166440f59c14a1a2c97ee381014b59c58f55b49ab05f31a38',
  },
  {
    label: 'awkweb',
    //         ^ latin small "e"
    expected:
      '0x7aaad03ddcacc63166440f59c14a1a2c97ee381014b59c58f55b49ab05f31a38',
  },
  {
    label: 'ʘ‿ʘ',
    expected:
      '0xc142daa955184f4c4992e064a059bd8950e0bff10db566df9068ae2d5379e652',
  },
  {
    label: '[9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658]',
    expected:
      '0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658',
  },
])("labelhash('$label') -> '$expected'", ({ label, expected }) => {
  expect(labelhash(label)).toBe(expected)
})
