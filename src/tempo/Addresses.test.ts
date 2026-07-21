import { expect, test } from 'vitest'
import * as Addresses from './Addresses.js'

test('validator addresses', () => {
  expect(Addresses.validator).toBe('0xcccccccc00000000000000000000000000000000')
  expect(Addresses.validatorV2).toBe(
    '0xcccccccc00000000000000000000000000000001',
  )
})
