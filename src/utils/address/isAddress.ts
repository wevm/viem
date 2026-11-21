import type { Address } from 'abitype'
import type { ErrorType } from '../../errors/utils.js'
import { LruMap } from '../lru.js'
import { checksumAddress } from './getAddress.js'

const addressRegex = /^0x[a-fA-F0-9]{40}$/

/** @internal */
export const isAddressCache = /*#__PURE__*/ new LruMap<boolean>(8192)

export type IsAddressOptions = {
  /**
   * Enables strict mode. Whether or not to compare the address against its checksum.
   *
   * @default true
   */
  strict?: boolean | undefined
}

export type IsAddressErrorType = ErrorType

/**
 * Checks if a string is a valid address.
 *
 * In strict mode (the default), a mixed-case address must match its
 * [EIP-55](https://eips.ethereum.org/EIPS/eip-55) checksum. An all-lowercase
 * address has no checksum and is valid.
 *
 * Use this to validate user input. {@link getAddress} does not validate the
 * checksum; it returns the checksummed form of any casing.
 *
 * - Docs: https://viem.sh/docs/utilities/isAddress
 *
 * @example
 * import { isAddress } from 'viem'
 *
 * isAddress('0x787bc77F1700DCE0f8c1581c18A12d3153D1B150')
 * // true
 * isAddress('0x787bc77F1700DCE0f8c1581c18A12d3153D1b150') // last `B` lowercased
 * // false
 * isAddress('0x787bc77f1700dce0f8c1581c18a12d3153d1b150')
 * // true
 */
export function isAddress(
  address: string,
  options?: IsAddressOptions | undefined,
): address is Address {
  const { strict = true } = options ?? {}
  if (!addressRegex.test(address)) return false
  if (!strict || address.toLowerCase() === address) return true

  // Only the checksum comparison is cached; the checks above are cheaper than a
  // cache lookup.
  let result = isAddressCache.get(address)
  if (result === undefined) {
    result = checksumAddress(address as Address) === address
    isAddressCache.set(address, result)
  }
  return result
}
