import { expect, test } from 'vitest'

import { generateNonce } from './generateNonce.js'

test('default', () => {
  const nonce = generateNonce()
  expect(nonce.length).toMatchInlineSnapshot('96')
})
