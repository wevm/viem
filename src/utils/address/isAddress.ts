import type { Address } from 'abitype'
import type { ErrorType } from '../../errors/utils.js'
import { checksumAddress } from './getAddress.js'

const addressRegex = /^0x[a-fA-F0-9]{40}$/

export type IsAddressErrorType = ErrorType

export function isAddress(address: string): address is Address {
  if (!addressRegex.test(address)) {
    return false
  }
  if (address.toLowerCase() === address) {
    return true
  }
  // @ts-ignore
  return checksumAddress(address) === address
}
