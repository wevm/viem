import { expect, test } from 'vitest'

import { generatePrivateKey } from './generatePrivateKey.js'

test('default', () => {
  expect(generatePrivateKey()).toBeDefined()
})
