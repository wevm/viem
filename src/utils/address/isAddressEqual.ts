import type { Address } from '../../types'
import { InvalidAddressError } from '../../errors'
import { isAddress } from './isAddress'

export function isAddressEqual(a: Address, b: Address) {
  if (!isAddress(a)) throw new InvalidAddressError({ address: a })
  if (!isAddress(b)) throw new InvalidAddressError({ address: b })
  return a.toLowerCase() === b.toLowerCase()
}
