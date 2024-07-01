import type { Address } from 'abitype'

import type { InvalidAddressErrorType } from '../../errors/address.js'
import type { ErrorType } from '../../errors/utils.js'

export type IsAddressEqualReturnType = boolean
export type IsAddressEqualErrorType = InvalidAddressErrorType | ErrorType

export function isAddressEqualLite(a: Address, b: Address) {
  return a.toLowerCase() === b.toLowerCase()
}
