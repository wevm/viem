import type { Address } from '../../types'
import { InvalidAddressError } from '../../errors'
import { getAddress } from './getAddress'
import { isAddress } from './isAddress'

export function isAddressEqualOld(a: Address, b: Address) {
  return getAddress(a) === getAddress(b)
}

export function isAddressEqual(a: Address, b: Address) {
  if (!isAddress(a)) throw new InvalidAddressError({ address: a })
  if (!isAddress(b)) throw new InvalidAddressError({ address: b })
  return a.toLowerCase() === b.toLowerCase()
}
