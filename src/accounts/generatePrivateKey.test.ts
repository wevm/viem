import { expect, test } from 'vitest'
import { generatePrivateKey } from './generatePrivateKey'

test('default', () => {
  expect(generatePrivateKey()).toBeDefined()
})
