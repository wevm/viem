import type { Address } from '../../types'
import { getAddress } from './getAddress'

export function isAddress(address: Address) {
  try {
    return Boolean(getAddress(address))
  } catch {
    return false
  }
}
