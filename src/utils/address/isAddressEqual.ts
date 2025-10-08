import type { Address } from 'abitype'
import * as ox_Address from 'ox/Address'

import type { InvalidAddressErrorType } from '../../errors/address.js'
import type { ErrorType } from '../../errors/utils.js'

// TODO: Use `@link` in TSDoc
/** @deprecated Use `boolean` instead. */
export type IsAddressEqualReturnType = boolean
/** @deprecated Use `Address.isEqual.ErrorType` instead. */
export type IsAddressEqualErrorType = InvalidAddressErrorType | ErrorType

/**
 * @deprecated Use `Address.isEqual` instead from `import { Address } from 'viem/utils'`
 */
export function isAddressEqual(a: Address, b: Address) {
  return ox_Address.isEqual(a, b)
}
