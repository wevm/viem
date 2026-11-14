import type { Address } from 'abitype'

import { InvalidAddressError } from '../../errors/address.js'
import type { ErrorType } from '../../errors/utils.js'
import {
  type StringToBytesErrorType,
  stringToBytes,
} from '../encoding/toBytes.js'
import { type Keccak256ErrorType, keccak256 } from '../hash/keccak256.js'
import { LruMap } from '../lru.js'
import { type IsAddressErrorType, isAddress } from './isAddress.js'

const checksumAddressCache = /*#__PURE__*/ new LruMap<Address>(8192)

export type ChecksumAddressErrorType =
  | Keccak256ErrorType
  | StringToBytesErrorType
  | ErrorType

/**
 * Returns the [EIP-55](https://eips.ethereum.org/EIPS/eip-55) checksummed form
 * of an address. The input's casing is ignored.
 *
 * Does not validate the input; use {@link getAddress} for untrusted strings.
 */
export function checksumAddress(
  address_: Address,
  /**
   * Warning: EIP-1191 checksum addresses are generally not backwards compatible with the
   * wider Ethereum ecosystem, meaning it will break when validated against an application/tool
   * that relies on EIP-55 checksum encoding (checksum without chainId).
   *
   * It is highly recommended to not use this feature unless you
   * know what you are doing.
   *
   * See more: https://github.com/ethereum/EIPs/issues/1121
   */
  chainId?: number | undefined,
): Address {
  // The checksum depends only on the lowercase address, so every casing of an
  // address shares one cache entry.
  const lower = address_.toLowerCase()
  const cacheKey = `${lower}.${chainId}`
  const cached = checksumAddressCache.get(cacheKey)
  if (cached) return cached

  const hexAddress = chainId ? `${chainId}${lower}` : lower.substring(2)
  const hash = keccak256(stringToBytes(hexAddress), 'bytes')

  const address = (
    chainId ? hexAddress.substring(`${chainId}0x`.length) : hexAddress
  ).split('')
  for (let i = 0; i < 40; i += 2) {
    if (hash[i >> 1] >> 4 >= 8 && address[i]) {
      address[i] = address[i].toUpperCase()
    }
    if ((hash[i >> 1] & 0x0f) >= 8 && address[i + 1]) {
      address[i + 1] = address[i + 1].toUpperCase()
    }
  }

  const result = `0x${address.join('')}` as const
  checksumAddressCache.set(cacheKey, result)
  return result
}

export type GetAddressErrorType =
  | ChecksumAddressErrorType
  | IsAddressErrorType
  | ErrorType

/**
 * Converts an address into its [EIP-55](https://eips.ethereum.org/EIPS/eip-55)
 * checksummed form. Throws if the string is not 20 bytes of hex.
 *
 * The input's casing is ignored, so an address with a wrong checksum is
 * returned with the correct one. To reject a wrong checksum, check the input
 * with {@link isAddress} first.
 *
 * - Docs: https://viem.sh/docs/utilities/getAddress
 *
 * @example
 * import { getAddress } from 'viem'
 *
 * getAddress('0x787bc77f1700dce0f8c1581c18a12d3153d1b150')
 * // '0x787bc77F1700DCE0f8c1581c18A12d3153D1B150'
 */
export function getAddress(
  address: string,
  /**
   * Warning: EIP-1191 checksum addresses are generally not backwards compatible with the
   * wider Ethereum ecosystem, meaning it will break when validated against an application/tool
   * that relies on EIP-55 checksum encoding (checksum without chainId).
   *
   * It is highly recommended to not use this feature unless you
   * know what you are doing.
   *
   * See more: https://github.com/ethereum/EIPs/issues/1121
   */
  chainId?: number,
): Address {
  if (!isAddress(address, { strict: false }))
    throw new InvalidAddressError({ address })
  return checksumAddress(address, chainId)
}
