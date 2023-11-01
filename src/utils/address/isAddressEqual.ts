import type { Address } from 'abitype'

import {
  InvalidAddressError,
  type InvalidAddressErrorType,
} from '../../errors/address.js'
import type { ErrorType } from '../../errors/utils.js'
import { isAddress } from './isAddress.js'

export type IsAddressEqualReturnType = boolean
export type IsAddressEqualErrorType = InvalidAddressErrorType | ErrorType

export function isAddressEqual(a: Address, b: Address) {
  if (!isAddress(a)) throw new InvalidAddressError({ address: a })
  if (!isAddress(b)) throw new InvalidAddressError({ address: b })
  return a.toLowerCase() === b.toLowerCase()
}
