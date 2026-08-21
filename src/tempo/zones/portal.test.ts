import { describe, expect, test } from 'vitest'
import {
  getZonePortalAddress,
  getZonePortalId,
  isZonePortalAddress,
} from './portal.js'

describe('Zone Portal addresses', () => {
  test('derives and parses a portal address', () => {
    const address = getZonePortalAddress(3)
    expect(address).toBe('0x5Ad0000000000000000000000000000000000003')
    expect(isZonePortalAddress(address)).toBe(true)
    expect(getZonePortalId(address)).toBe(3)
  })

  test('rejects addresses outside the portal range', () => {
    const address = '0x5AD1000000000000000000000000000000000000'
    expect(isZonePortalAddress(address)).toBe(false)
    expect(getZonePortalId(address)).toBeUndefined()
    expect(
      isZonePortalAddress('0x5ad0000000000000000000000000000100000000'),
    ).toBe(false)
  })

  test('rejects invalid Zone IDs', () => {
    expect(() => getZonePortalAddress(-1)).toThrow(RangeError)
    expect(() => getZonePortalAddress(2n ** 32n)).toThrow(RangeError)
  })
})
