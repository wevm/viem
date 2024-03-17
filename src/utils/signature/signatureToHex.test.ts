import { expect, test } from 'vitest'

import { toHex } from '../../utils/encoding/toHex.js'

import { signatureToHex } from './signatureToHex.js'

test('default', () => {
  expect(
    signatureToHex({
      r: toHex(
        49782753348462494199823712700004552394425719014458918871452329774910450607807n,
      ),
      s: toHex(
        33726695977844476214676913201140481102225469284307016937915595756355928419768n,
      ),
      yParity: 1,
    }),
  ).toMatchInlineSnapshot(
    '"0x6e100a352ec6ad1b70802290e18aeed190704973570f3b8ed42cb9808e2ea6bf4a90a229a244495b41890987806fcbd2d5d23fc0dbe5f5256c2613c039d76db81c"',
  )

  expect(
    signatureToHex({
      r: toHex(
        49782753348462494199823712700004552394425719014458918871452329774910450607807n,
      ),
      s: toHex(
        33726695977844476214676913201140481102225469284307016937915595756355928419768n,
      ),
      yParity: 0,
    }),
  ).toMatchInlineSnapshot(
    '"0x6e100a352ec6ad1b70802290e18aeed190704973570f3b8ed42cb9808e2ea6bf4a90a229a244495b41890987806fcbd2d5d23fc0dbe5f5256c2613c039d76db81b"',
  )
})
