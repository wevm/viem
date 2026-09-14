import type { Address } from 'abitype'
import type { ErrorType } from '../../errors/utils.js'
import type { Hex } from '../../types/misc.js'
import {
  type EncodeAbiParametersErrorType,
  encodeAbiParameters,
} from '../../utils/abi/encodeAbiParameters.js'
import { type ConcatHexErrorType, concatHex } from '../../utils/data/concat.js'
import { stringToHex, type ToHexErrorType } from '../../utils/encoding/toHex.js'
import {
  type Keccak256ErrorType,
  keccak256,
} from '../../utils/hash/keccak256.js'
import type { AaChange } from '../types/transaction.js'
import { encodeChangePayload } from './actorChangeData.js'

/** `keccak256("AccountChange(uint8 changeType,bytes payload)")` */
export const accountChangeTypehash = keccak256(
  stringToHex('AccountChange(uint8 changeType,bytes payload)'),
)

/**
 * `keccak256("SignedAccountChangeBatch(address account,uint256 chainId,uint64 sequence,AccountChange[] changes)AccountChange(uint8 changeType,bytes payload)")`
 *
 * Mirrors `Keystore.SIGNED_ACCOUNT_CHANGES_TYPEHASH`. The struct name is
 * `SignedAccountChangeBatch` (the wire struct passed to
 * `applySignedAccountChanges` is still named `SignedAccountChanges`, but the
 * signing typehash uses the `Batch` name — they must match the contract byte
 * for byte or the node rejects the signature).
 */
export const signedAccountChangesTypehash = keccak256(
  stringToHex(
    'SignedAccountChangeBatch(address account,uint256 chainId,uint64 sequence,AccountChange[] changes)AccountChange(uint8 changeType,bytes payload)',
  ),
)

export type HashAccountChangesParameters = {
  /** The account whose configuration is changing. */
  account: Address
  /**
   * The replay chain id bound into the digest: `block.chainid` for the `'local'`
   * channel, `0` for `'multichain'`.
   */
  chainId: number | bigint
  /** The channel sequence word (`uint64`). */
  sequence: number | bigint
  /** The ordered ops in the batch. */
  changes: readonly AaChange[]
}

export type HashAccountChangesErrorType =
  | EncodeAbiParametersErrorType
  | ConcatHexErrorType
  | Keccak256ErrorType
  | ToHexErrorType
  | ErrorType

/**
 * Computes the EIP-8130 `SignedAccountChanges` batch signature digest
 * (`Keystore._changesDigest`):
 *
 * ```
 * changeHashes = [keccak256(abi.encode(ACCOUNT_CHANGE_TYPEHASH, changeType, keccak256(payload)))]
 * changesHash  = keccak256(abi.encodePacked(changeHashes))
 * digest       = keccak256(abi.encode(SIGNED_ACCOUNT_CHANGES_TYPEHASH, account, chainId, sequence, changesHash))
 * ```
 *
 * The resulting digest is signed (in `authenticator || data` form) to produce
 * the config entry's `signature`.
 */
export function hashAccountChanges(
  parameters: HashAccountChangesParameters,
): Hex {
  const { account, chainId, sequence, changes } = parameters

  const changeHashes = changes.map((change) =>
    keccak256(
      encodeAbiParameters(
        [{ type: 'bytes32' }, { type: 'uint8' }, { type: 'bytes32' }],
        [
          accountChangeTypehash,
          change.changeType,
          keccak256(encodeChangePayload(change)),
        ],
      ),
    ),
  )
  const changesHash = keccak256(concatHex(changeHashes))

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
        signedAccountChangesTypehash,
        account,
        BigInt(chainId),
        BigInt(sequence),
        changesHash,
      ],
    ),
  )
}
