import type { Address } from 'abitype'
import type { ErrorType } from '../../../errors/utils.js'
import type { Hex } from '../../../types/misc.js'
import {
  type EncodeAbiParametersErrorType,
  encodeAbiParameters,
} from '../../../utils/abi/encodeAbiParameters.js'
import {
  type ConcatHexErrorType,
  concatHex,
} from '../../../utils/data/concat.js'
import {
  stringToHex,
  type ToHexErrorType,
} from '../../../utils/encoding/toHex.js'
import {
  type Keccak256ErrorType,
  keccak256,
} from '../../../utils/hash/keccak256.js'
import type { AaActorChange } from '../types/transaction.js'
import { encodeActorChangeData } from './actorChangeData.js'

/** `keccak256("ActorChange(uint8 changeType,bytes32 actorId,bytes data)")` */
export const actorChangeTypehash = keccak256(
  stringToHex('ActorChange(uint8 changeType,bytes32 actorId,bytes data)'),
)

/**
 * `keccak256("SignedActorChanges(address account,uint256 chainId,uint64 sequence,ActorChange[] actorChanges)ActorChange(uint8 changeType,bytes32 actorId,bytes data)")`
 */
export const signedActorChangesTypehash = keccak256(
  stringToHex(
    'SignedActorChanges(address account,uint256 chainId,uint64 sequence,ActorChange[] actorChanges)ActorChange(uint8 changeType,bytes32 actorId,bytes data)',
  ),
)

export type HashActorChanges8130Parameters = {
  /** The account whose actor configuration is changing. */
  account: Address
  /** Chain ID scope. `0` = valid on any chain (multichain channel). */
  chainId: number
  /** Monotonic ordering sequence within the channel. */
  sequence: number
  /** Actor change operations. */
  actorChanges: readonly AaActorChange[]
}

export type HashActorChanges8130ErrorType =
  | EncodeAbiParametersErrorType
  | ConcatHexErrorType
  | Keccak256ErrorType
  | ToHexErrorType
  | ErrorType

/**
 * Computes the EIP-8130 config-change (`SignedActorChanges`) signature digest:
 *
 * ```
 * actorChangeHashes = [keccak256(abi.encode(ACTORCHANGE_TYPEHASH, changeType, actorId, keccak256(data)))]
 * actorChangesHash  = keccak256(abi.encodePacked(actorChangeHashes))
 * digest            = keccak256(abi.encode(TYPEHASH, account, chainId, sequence, actorChangesHash))
 * ```
 *
 * The resulting digest is signed (in `authenticator || data` form) to produce
 * the config-change entry's `auth`.
 */
export function hashActorChanges8130(
  parameters: HashActorChanges8130Parameters,
): Hex {
  const { account, chainId, sequence, actorChanges } = parameters

  const actorChangeHashes = actorChanges.map((change) =>
    keccak256(
      encodeAbiParameters(
        [
          { type: 'bytes32' },
          { type: 'uint8' },
          { type: 'bytes32' },
          { type: 'bytes32' },
        ],
        [
          actorChangeTypehash,
          change.changeType,
          change.actorId,
          keccak256(encodeActorChangeData(change)),
        ],
      ),
    ),
  )
  const actorChangesHash = keccak256(concatHex(actorChangeHashes))

  return keccak256(
    encodeAbiParameters(
      [
        { type: 'bytes32' },
        { type: 'address' },
        { type: 'uint256' },
        { type: 'uint64' },
        { type: 'bytes32' },
      ],
      [
        signedActorChangesTypehash,
        account,
        BigInt(chainId),
        BigInt(sequence),
        actorChangesHash,
      ],
    ),
  )
}
