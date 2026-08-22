import type { ErrorType } from '../../errors/utils.js'
import type { Hex } from '../../types/misc.js'
import {
  type EncodeAbiParametersErrorType,
  encodeAbiParameters,
} from '../../utils/abi/encodeAbiParameters.js'
import { stringToHex, type ToHexErrorType } from '../../utils/encoding/toHex.js'
import {
  type Keccak256ErrorType,
  keccak256,
} from '../../utils/hash/keccak256.js'
import type { AaChange } from '../types/transaction.js'
import { encodeChangePayload } from './actorChangeData.js'

/**
 * `keccak256("ERC4337Account.signedActorChanges.v1")` — the 32-byte discriminator
 * that prefixes a `BackwardCompatibleERC4337Account` UserOperation signature
 * carrying validation-phase actor changes.
 */
export const signedActorChangesMagic = keccak256(
  stringToHex('ERC4337Account.signedActorChanges.v1'),
)

export type SignedActorChangeSet = {
  /**
   * Ops applied as one batch (consuming one sequence). Use a {@link key} builder
   * + {@link authorizeActor}/{@link revokeActor} to construct.
   */
  changes: readonly AaChange[]
  /**
   * Authorization over the batch digest in `authenticator || data` form, as
   * produced by {@link signAccountChanges} (its `signature` field).
   */
  auth: Hex
}

const signatureParameters = [
  { type: 'bytes32' },
  {
    type: 'tuple[]',
    components: [
      {
        name: 'changes',
        type: 'tuple[]',
        components: [
          { name: 'changeType', type: 'uint8' },
          { name: 'payload', type: 'bytes' },
        ],
      },
      { name: 'auth', type: 'bytes' },
    ],
  },
  { name: 'opAuth', type: 'bytes' },
] as const

export type EncodeSignedActorChangesSignatureErrorType =
  | EncodeAbiParametersErrorType
  | Keccak256ErrorType
  | ToHexErrorType
  | ErrorType

/**
 * Encodes a `BackwardCompatibleERC4337Account` validation-phase signature that
 * carries signed actor changes:
 *
 * ```
 * abi.encode(bytes32 SIGNED_ACTOR_CHANGES_MAGIC, SignedActorChanges[] changeSets, bytes opAuth)
 * ```
 *
 * where each `SignedActorChanges` is `(ActorChange[] changes, bytes auth)` and
 * `opAuth` is an `authenticator || data` blob that authorizes the operation over
 * `userOpHash` (may be produced by a key the changes just added/rotated to).
 *
 * Use the result as a UserOperation's `signature`. During `validateUserOp` the
 * account first applies each set in order via `AccountConfiguration.applySignedActorChanges`,
 * then authenticates the op via `opAuth`. Sets are applied in array order, so a
 * later set may rely on an actor authorized by an earlier one (e.g. owner → key B,
 * then key B → key C).
 *
 * @example
 * ```ts
 * const set = await signAccountChanges({
 *   signer: owner,
 *   account: smartAccount,
 *   chainId: baseSepolia.id,
 *   sequence,
 *   changes: [authorizeActor(key.p256({ x, y }), { scope: actorScope.sender })],
 * })
 * // opAuth: authenticator-prefixed signature over the userOpHash by any authorized actor
 * const opAuth = concatHex([ecrecoverAuthenticator, await owner.sign({ hash: userOpHash })])
 * const signature = encodeSignedActorChangesSignature([set], opAuth)
 * ```
 */
export function encodeSignedActorChangesSignature(
  changeSets: readonly SignedActorChangeSet[],
  opAuth: Hex,
): Hex {
  return encodeAbiParameters(signatureParameters, [
    signedActorChangesMagic,
    changeSets.map((set) => ({
      changes: set.changes.map((change) => ({
        changeType: change.changeType,
        payload: encodeChangePayload(change),
      })),
      auth: set.auth,
    })),
    opAuth,
  ])
}
