import type { Address } from 'abitype'
import type { ErrorType } from '../../../errors/utils.js'
import type { Hex } from '../../../types/misc.js'
import { type PadErrorType, pad } from '../../../utils/data/pad.js'

export type ActorIdFromAddressErrorType = PadErrorType | ErrorType

/**
 * Derives the `actorId` for an address-based actor: `bytes32(bytes20(address))`.
 *
 * Used for the implicit EOA actor, `k1` (`ECRECOVER_AUTHENTICATOR`), and
 * `delegate` actors. `bytesN` widening is left-aligned, so the 20-byte address
 * occupies the high-order bytes and the remaining 12 bytes are zero.
 */
export function actorIdFromAddress(address: Address): Hex {
  return pad(address, { dir: 'right', size: 32 })
}
