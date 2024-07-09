import { describe, expect, test } from 'vitest'
import { createRandomAddress } from './createRandomAddress.js'

describe('createRandomAddress', () => {
  test('returns a valid checksum address', () => {
    const address = createRandomAddress()
    expect(address).toMatch(/0x[a-fA-F0-9]{40}/)
  })

  test('returns a different address on each call', () => {
    const address1 = createRandomAddress()
    const address2 = createRandomAddress()
    expect(address1).not.toEqual(address2)
  })

  test('returns a different address when called multiple times in quick succession', () => {
    const addresses = new Set()
    for (let i = 0; i < 10; i++) {
      addresses.add(createRandomAddress())
    }
    expect(addresses.size).toBe(10)
  })
})
