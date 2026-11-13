import type { Address } from 'abitype'

import { BaseError } from '../../errors/base.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Hex } from '../../types/misc.js'
import {
  type ChecksumAddressErrorType,
  checksumAddress,
} from '../../utils/address/getAddress.js'
import {
  type Keccak256ErrorType,
  keccak256,
} from '../../utils/hash/keccak256.js'

export type PublicKeyToAddressErrorType =
  | ChecksumAddressErrorType
  | InvalidPublicKeyErrorType
  | Keccak256ErrorType
  | ErrorType

/**
 * @description Converts an ECDSA public key to an address.
 *
 * @param publicKey The uncompressed public key (65 bytes, `0x04` prefix) to convert.
 *
 * @returns The address.
 */
export function publicKeyToAddress(publicKey: Hex): Address {
  // The address is derived from both coordinates, so a compressed public key
  // (or one without the `0x04` prefix) throws.
  if (publicKey.length !== 132 || !publicKey.startsWith('0x04'))
    throw new InvalidPublicKeyError({ publicKey })
  const address = keccak256(`0x${publicKey.substring(4)}`).substring(26)
  return checksumAddress(`0x${address}`) as Address
}

/** Type of {@link InvalidPublicKeyError}. */
export type InvalidPublicKeyErrorType = InvalidPublicKeyError & {
  name: 'InvalidPublicKeyError'
}

/**
 * Thrown by `publicKeyToAddress` when the public key is not an uncompressed
 * secp256k1 public key.
 */
export class InvalidPublicKeyError extends BaseError {
  constructor({ publicKey }: { publicKey: Hex }) {
    super(`Public key "${publicKey}" is invalid.`, {
      metaMessages: [
        '- Public key must be uncompressed: 65 bytes with a `0x04` prefix.',
      ],
      name: 'InvalidPublicKeyError',
    })
  }
}
