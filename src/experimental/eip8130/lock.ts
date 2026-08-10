import { BaseError } from '../../errors/base.js'
import { changeType } from './constants.js'
import type { AaLock, AaUnlock } from './types/transaction.js'

/**
 * Account locking (EIP-8130 `Keystore`).
 *
 * Locking an account freezes it against a compromised key: it blocks
 * configuration changes and delegation, and unlocking is time-delayed
 * (`unlockDelay`), giving the owner a window to react. Locked accounts are
 * eligible for elevated per-account rate limits.
 *
 * Lock/unlock are `ChangeType` ops inside a `SignedAccountChanges` batch: the
 * account's admin (`scope == 0`) actor signs a batch carrying a single
 * {@link lockChange} / {@link unlockChange} op, on the **Local** channel only
 * (they consume the local `sequence` and must be the batch's only op). Build the
 * op, sign it via {@link signAccountChanges} (`channel: 'local'`), and apply it
 * via {@link encodeApplySignedAccountChangesData} (or include the resulting
 * `config` entry in a transaction's `accountChanges`). Read the current state
 * with {@link getLockStatus} / {@link isLocked}.
 *
 * @remarks The enshrined node currently **defers** lock/unlock — a batch
 * carrying one is rejected on the native path. These builders are
 * contract-accurate (they match the finalized `Keystore`) but are not yet
 * accepted by the node.
 *
 * @example
 * ```ts
 * import {
 *   lockChange,
 *   signAccountChanges,
 *   encodeApplySignedAccountChangesData,
 *   getConfigSequence,
 *   sendCalls,
 * } from 'viem/experimental/eip8130'
 *
 * const { local } = await getConfigSequence(client, { accountConfiguration, account })
 * const entry = await signAccountChanges({
 *   signer: admin,
 *   account,
 *   channel: 'local',
 *   chainId,
 *   sequence: local,
 *   changes: [lockChange({ unlockDelay: 3600 })],
 * })
 * const data = encodeApplySignedAccountChangesData({ account, ...entry })
 * await sendCalls(client, { account, calls: [{ to: accountConfiguration, data }], gas })
 * ```
 */

/** Maximum `unlockDelay` (the payload field is `uint16`). */
export const maxUnlockDelay = 0xffff

export type LockChangeParameters = {
  /**
   * Delay in seconds between the unlock being initiated and the account becoming
   * unlocked (`uint16`, `1 … 65535`). A larger delay gives more time to respond
   * to a compromised key.
   */
  unlockDelay: number
}

/**
 * Builds a `lock` ({@link AaLock}) op that hard-locks the account with a delayed
 * unlock. Local channel only; must be the batch's only op.
 */
export function lockChange(parameters: LockChangeParameters): AaLock {
  const { unlockDelay } = parameters
  if (
    !Number.isInteger(unlockDelay) ||
    unlockDelay < 1 ||
    unlockDelay > maxUnlockDelay
  )
    throw new BaseError(
      `\`unlockDelay\` must be an integer in \`1 … ${maxUnlockDelay}\` (uint16 seconds). Received ${unlockDelay}.`,
    )
  return { changeType: changeType.lock, unlockDelay }
}

/**
 * Builds an `unlock` ({@link AaUnlock}) op that initiates the (time-delayed)
 * unlock (consuming the stored `unlockDelay`). Local channel only; must be the
 * batch's only op. The account becomes unlocked `unlockDelay` seconds later.
 */
export function unlockChange(): AaUnlock {
  return { changeType: changeType.unlock }
}
