import { expect, test } from 'vitest'

import { generateSiweNonce } from './generateSiweNonce.js'

test('default', () => {
  const nonce = generateSiweNonce()
  expect(nonce.length).toMatchInlineSnapshot('96')
})

test('behavior: consecutive nonces share no window', () => {
  const [a, b] = [generateSiweNonce(), generateSiweNonce()]

  expect(b.startsWith(a.slice(1, 16))).toMatchInlineSnapshot('false')
})
