import type { Address } from 'abitype'
import type { ErrorType } from '../../errors/utils.js'

const addressRegex = /^0x[a-fA-F0-9]{40}$/

export type IsAddressErrorType = ErrorType

export function isAddress(address: string): address is Address {
  return addressRegex.test(address)
}
