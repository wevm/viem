import type { Address } from '../../types'
import { getAddress } from './getAddress'

export function isAddressEqual(a: Address, b: Address) {
  return getAddress(a) === getAddress(b)
}
