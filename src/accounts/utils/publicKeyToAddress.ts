import type { Address, Hex } from '../../types/index.js'
import { keccak256 } from '../../utils/index.js'
import { checksumAddress } from '../../utils/address/index.js'

/**
 * @description Converts an ECDSA public key to an address.
 *
 * @param publicKey The public key to convert.
 *
 * @returns The address.
 */
export function publicKeyToAddress(publicKey: Hex): Address {
  const address = keccak256(`0x${publicKey.substring(4)}`).substring(26)
  return checksumAddress(`0x${address}`) as Address
}
