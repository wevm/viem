import type { Address } from 'abitype'
import { BaseError } from '../../../errors/base.js'
import type { ErrorType } from '../../../errors/utils.js'
import {
  type ConcatHexErrorType,
  concatHex,
} from '../../../utils/data/concat.js'
import { ecrecoverAuthenticator } from '../constants.js'
import type {
  AaAccountChangeConfig,
  AaActorChange,
} from '../types/transaction.js'
import {
  type HashActorChanges8130ErrorType,
  hashActorChanges8130,
} from './hashActorChanges.js'
import type { Signer } from './signTransaction.js'

export type SignActorChanges8130Parameters = {
  /** Signer producing the config-change `auth` (the authorizing actor's key). */
  signer: Signer
  /**
   * The account whose actor configuration is changing. Defaults to the signer's
   * address (an account authorizing its own changes).
   */
  account?: Address | undefined
  /** Chain ID scope. `0` = valid on any chain (multichain channel). */
  chainId: number
  /** Monotonic ordering sequence within the channel. */
  sequence: number
  /** Actor change operations. */
  actorChanges: readonly AaActorChange[]
  /**
   * Authenticator address for the `auth` blob. Defaults to
   * `ECRECOVER_AUTHENTICATOR` (native secp256k1).
   */
  authenticator?: Address | undefined
}

export type SignActorChanges8130ErrorType =
  | HashActorChanges8130ErrorType
  | ConcatHexErrorType
  | BaseError
  | ErrorType

/**
 * Signs a set of EIP-8130 actor changes and returns a ready-to-use `config`
 * account-change entry (with `auth` in `authenticator || data` form) that can be
 * placed in a transaction's `accountChanges` or submitted via
 * `applySignedActorChanges`.
 */
export async function signActorChanges8130(
  parameters: SignActorChanges8130Parameters,
): Promise<AaAccountChangeConfig> {
  const {
    signer,
    chainId,
    sequence,
    actorChanges,
    authenticator = ecrecoverAuthenticator,
  } = parameters
  const account = parameters.account ?? signer.address

  if (!signer.sign)
    throw new BaseError('`signer` does not support raw signing.')

  const digest = hashActorChanges8130({
    account,
    chainId,
    sequence,
    actorChanges,
  })
  const signature = await signer.sign({ hash: digest })
  const auth = concatHex([authenticator, signature])

  return { type: 'config', chainId, sequence, actorChanges, auth }
}
