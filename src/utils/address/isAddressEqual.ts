import type { Address } from 'abitype'

import { InvalidAddressError } from '../../errors/address.js'

import { isAddress } from './isAddress.js'

export function isAddressEqual(a: Address, b: Address) {
  if (!isAddress(a)) throw new InvalidAddressError({ address: a })
  if (!isAddress(b)) throw new InvalidAddressError({ address: b })
  return a.toLowerCase() === b.toLowerCase()
}
