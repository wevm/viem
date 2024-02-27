import type { Address } from 'abitype'
import type { ErrorType } from '../../errors/utils.js'
import { LruMap } from '../lru.js'
import { checksumAddress } from './getAddress.js'

const addressRegex = /^0x[a-fA-F0-9]{40}$/

export const isAddressCache = /*#__PURE__*/ new LruMap<boolean>(8192)

export type IsAddressOptions = {
  /**
   * Enables strict mode. Whether or not to compare the address against its checksum.
   *
   * @default true
   */
  strict?: boolean
}

export type IsAddressErrorType = ErrorType

export function isAddress(
  address: string,
  { strict = true }: IsAddressOptions = {},
): address is Address {
  if (isAddressCache.has(address)) return isAddressCache.get(address)!

  const result = (() => {
    if (!addressRegex.test(address)) return false
    if (address.toLowerCase() === address) return true
    if (strict) return checksumAddress(address as Address) === address
    return true
  })()
  isAddressCache.set(address, result)
  return result
}
