import { expect, test } from 'vitest'

import { generateSiweNonce } from './generateSiweNonce.js'

test('default', () => {
  const nonce = generateSiweNonce()
  expect(nonce.length).toMatchInlineSnapshot('96')
})
