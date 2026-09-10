import type { Address } from 'abitype'
import { BaseError } from '../../errors/base.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Hex } from '../../types/misc.js'
import { concatHex } from '../../utils/data/concat.js'
import { type PadErrorType, pad } from '../../utils/data/pad.js'
import { size } from '../../utils/data/size.js'
import { keccak256 } from '../../utils/hash/keccak256.js'

export type ActorIdFromAddressErrorType = PadErrorType | ErrorType

/**
 * Derives the `actorId` for an address-based actor:
 * `bytes32(uint256(uint160(address)))`.
 *
 * Used for the implicit EOA actor, `k1` (`ECRECOVER_AUTHENTICATOR`), and
 * `delegate` actors. The 20-byte address is right-aligned into the low-order
 * bytes and the high 12 bytes are zero (matches `Keystore.ActorId.fromAddress`
 * and enables the standard `address(uint160(uint256(id)))` round-trip).
 */
export function actorIdFromAddress(address: Address): Hex {
  return pad(address, { dir: 'left', size: 32 })
}

export type ActorIdFromPublicKeyErrorType = BaseError | ErrorType

/**
 * Derives the `actorId` for a public-key actor (`p256`, `passkey`):
 * `keccak256(abi.encodePacked(x, y))`.
 *
 * Accepts the affine coordinates as 32-byte hex values, or a single 64-byte
 * concatenated `x || y` public key.
 */
export function actorIdFromPublicKey(publicKey: { x: Hex; y: Hex } | Hex): Hex {
  if (typeof publicKey === 'string') {
    if (size(publicKey) !== 64)
      throw new BaseError(
        `Public key must be 64 bytes (x || y); got ${size(publicKey)} bytes.`,
      )
    return keccak256(publicKey)
  }
  const { x, y } = publicKey
  if (size(x) !== 32 || size(y) !== 32)
    throw new BaseError('Public key coordinates `x` and `y` must be 32 bytes.')
  return keccak256(concatHex([x, y]))
}
