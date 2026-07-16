import type { Address } from 'abitype'
import { BaseError } from '../../errors/base.js'
import { encodeAbiParameters } from '../../utils/abi/encodeAbiParameters.js'
import { encodeFunctionData } from '../../utils/abi/encodeFunctionData.js'
import { stringToHex } from '../../utils/encoding/toHex.js'
import { keccak256 } from '../../utils/hash/keccak256.js'
import type { Hex } from '../../types/misc.js'
import { accountConfigurationAbi } from './abis.js'
import {
  accountConfigAddress as defaultAccountConfigAddress,
  lockOp,
  unlockOp,
} from './constants.js'
import type { AaCall } from './types/transaction.js'

/**
 * Account locking (EIP-8130 `AccountConfiguration`).
 *
 * Locking an account freezes it against a compromised key: it blocks
 * configuration changes and delegation, and unlocking is time-delayed
 * (`unlockDelay`), giving the owner a window to react. Locked accounts are
 * eligible for elevated per-account rate limits.
 *
 * Lock changes are a **signed** operation (like `applySignedActorChanges`): the
 * account's admin (`scope == 0`) actor signs the {@link hashLockChange8130}
 * digest, and the resulting `authenticator || data` blob is passed to
 * `AccountConfiguration.applySignedLockChanges(account, op, unlockDelay, auth)`.
 * Lock changes are local-channel only, so the digest binds the current
 * `chainId` and consumes the account's local change `sequence`. Read the current
 * state with {@link getLockStatus8130} / {@link isLocked8130}.
 *
 * @example
 * ```ts
 * import {
 *   hashLockChange8130,
 *   lockCall,
 *   getChangeSequences8130, // local sequence source
 *   sendCalls8130,
 * } from 'viem/experimental/eip8130'
 *
 * // 1) hash + sign the lock (1-hour unlock delay) with an admin key
 * const digest = hashLockChange8130({ account, chainId, op: 'lock', unlockDelay: 3600, sequence })
 * const auth = await signDigest(digest) // `authenticator || data`
 *
 * // 2) submit the signed lock change
 * await sendCalls8130(client, { account, calls: [lockCall({ account, unlockDelay: 3600, auth })], gas })
 * ```
 */

/** Maximum `unlockDelay` (the ABI field is `uint16`). */
const maxUnlockDelay = 0xffff

/** `keccak256("SignedLockChange(address account,uint256 chainId,uint8 op,uint16 unlockDelay,uint64 sequence)")` */
export const lockChangeTypehash = keccak256(
  stringToHex(
    'SignedLockChange(address account,uint256 chainId,uint8 op,uint16 unlockDelay,uint64 sequence)',
  ),
)

export type LockChangeOp = 'lock' | 'unlock'

function opByte(op: LockChangeOp): number {
  return op === 'lock' ? lockOp : unlockOp
}

export type HashLockChange8130Parameters = {
  /** The account whose lock state is changing. */
  account: Address
  /** Chain ID (lock changes are local-channel only; use the current chain). */
  chainId: number
  /** `'lock'` (hard-lock) or `'unlock'` (initiate the delayed unlock). */
  op: LockChangeOp
  /**
   * Unlock delay in seconds (`uint16`, `1 … 65535`). Required and non-zero for
   * `'lock'`; MUST be `0` for `'unlock'` (which consumes the stored delay).
   */
  unlockDelay: number
  /** The account's local change sequence (from `getChangeSequences8130`). */
  sequence: number
}

/**
 * Computes the EIP-8130 `SignedLockChange` signature digest:
 * `keccak256(abi.encode(LOCK_CHANGE_TYPEHASH, account, chainId, op, unlockDelay, sequence))`.
 *
 * Sign it (in `authenticator || data` form, with an admin key) to produce the
 * `auth` passed to {@link lockCall} / {@link initiateUnlockCall}.
 */
export function hashLockChange8130(
  parameters: HashLockChange8130Parameters,
): Hex {
  const { account, chainId, op, unlockDelay, sequence } = parameters
  return keccak256(
    encodeAbiParameters(
      [
        { type: 'bytes32' },
        { type: 'address' },
        { type: 'uint256' },
        { type: 'uint8' },
        { type: 'uint16' },
        { type: 'uint64' },
      ],
      [
        lockChangeTypehash,
        account,
        BigInt(chainId),
        opByte(op),
        unlockDelay,
        BigInt(sequence),
      ],
    ),
  )
}

export type LockCallParameters = {
  /** The account being locked (bound into the signed digest and the call). */
  account: Address
  /**
   * Delay in seconds between {@link initiateUnlockCall} and the account becoming
   * unlocked (`uint16`, `1 … 65535`). A larger delay gives more time to respond
   * to a compromised key.
   */
  unlockDelay: number
  /** Admin signature over {@link hashLockChange8130} (`authenticator || data`). */
  auth: Hex
  /**
   * `AccountConfiguration` system contract. Defaults to the canonical
   * (enshrined) address, which is identical on every supported chain.
   */
  accountConfiguration?: Address | undefined
}

/**
 * Builds the account call that hard-locks the account:
 * `AccountConfiguration.applySignedLockChanges(account, LOCK_OP, unlockDelay, auth)`.
 * Include it in a {@link sendCalls8130} phase.
 */
export function lockCall(parameters: LockCallParameters): AaCall {
  const {
    account,
    unlockDelay,
    auth,
    accountConfiguration = defaultAccountConfigAddress,
  } = parameters
  if (
    !Number.isInteger(unlockDelay) ||
    unlockDelay < 1 ||
    unlockDelay > maxUnlockDelay
  )
    throw new BaseError(
      `\`unlockDelay\` must be an integer in \`1 … ${maxUnlockDelay}\` (uint16 seconds). Received ${unlockDelay}.`,
    )
  return {
    to: accountConfiguration,
    data: encodeFunctionData({
      abi: accountConfigurationAbi,
      functionName: 'applySignedLockChanges',
      args: [account, lockOp, unlockDelay, auth],
    }),
  }
}

export type InitiateUnlockCallParameters = {
  /** The account being unlocked (bound into the signed digest and the call). */
  account: Address
  /** Admin signature over {@link hashLockChange8130} (`authenticator || data`). */
  auth: Hex
  /**
   * `AccountConfiguration` system contract. Defaults to the canonical
   * (enshrined) address, which is identical on every supported chain.
   */
  accountConfiguration?: Address | undefined
}

/**
 * Builds the account call that begins the (time-delayed) unlock:
 * `AccountConfiguration.applySignedLockChanges(account, UNLOCK_OP, 0, auth)`.
 * Include it in a {@link sendCalls8130} phase. The account becomes unlocked
 * `unlockDelay` seconds later (see {@link getLockStatus8130}).
 */
export function initiateUnlockCall(
  parameters: InitiateUnlockCallParameters,
): AaCall {
  const {
    account,
    auth,
    accountConfiguration = defaultAccountConfigAddress,
  } = parameters
  return {
    to: accountConfiguration,
    data: encodeFunctionData({
      abi: accountConfigurationAbi,
      functionName: 'applySignedLockChanges',
      args: [account, unlockOp, 0, auth],
    }),
  }
}
