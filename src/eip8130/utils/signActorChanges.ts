import type { Address } from 'abitype'
import { BaseError } from '../../errors/base.js'
import type { ErrorType } from '../../errors/utils.js'
import { type ConcatHexErrorType, concatHex } from '../../utils/data/concat.js'
import { ecrecoverAuthenticator } from '../constants.js'
import type {
  AaAccountChangeConfig,
  AaChange,
  AaChangeChannel,
} from '../types/transaction.js'
import {
  type HashAccountChangesErrorType,
  hashAccountChanges,
} from './hashActorChanges.js'
import type { Signer } from './signTransaction.js'

export type SignAccountChangesParameters = {
  /** Signer producing the batch `signature` (the authorizing admin actor's key). */
  signer: Signer
  /**
   * The account whose configuration is changing. Defaults to the signer's
   * address (an account authorizing its own changes).
   */
  account?: Address | undefined
  /**
   * Replay channel. `'local'` binds `chainId`; `'multichain'` binds chain id
   * `0`. @default 'local'
   */
  channel?: AaChangeChannel | undefined
  /**
   * The local chain id, bound into the digest on the `'local'` channel (ignored
   * for `'multichain'`, which binds `0`).
   */
  chainId: number
  /** The channel sequence word (`uint64`; source from `getConfigSequence`). */
  sequence: bigint
  /** The ordered ops in the batch. */
  changes: readonly AaChange[]
  /**
   * Authenticator address for the `signature` blob. Defaults to
   * `signer.authenticator`, then `ECRECOVER_AUTHENTICATOR` (native secp256k1).
   */
  authenticator?: Address | undefined
}

export type SignAccountChangesErrorType =
  | HashAccountChangesErrorType
  | ConcatHexErrorType
  | BaseError
  | ErrorType

/**
 * Signs an EIP-8130 `SignedAccountChanges` batch and returns a ready-to-use
 * `config` account-change entry (with `signature` in `authenticator || data`
 * form) that can be placed in a transaction's `accountChanges` or submitted via
 * `applySignedAccountChanges`.
 */
export async function signAccountChanges(
  parameters: SignAccountChangesParameters,
): Promise<AaAccountChangeConfig> {
  const { signer, chainId, sequence, changes } = parameters
  const channel = parameters.channel ?? 'local'
  const authenticator =
    parameters.authenticator ?? signer.authenticator ?? ecrecoverAuthenticator
  const account = parameters.account ?? signer.address

  if (!signer.sign)
    throw new BaseError('`signer` does not support raw signing.')

  const digest = hashAccountChanges({
    account,
    chainId: channel === 'local' ? chainId : 0,
    sequence,
    changes,
  })
  const signature = concatHex([
    authenticator,
    await signer.sign({ hash: digest }),
  ])

  return { type: 'config', channel, sequence, changes, signature }
}
