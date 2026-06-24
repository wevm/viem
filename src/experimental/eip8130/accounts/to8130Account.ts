import type { Address } from 'abitype'
import { BaseError } from '../../../errors/base.js'
import type { Hex } from '../../../types/misc.js'
import {
  accountConfigAddress as defaultAccountConfigAddress,
  ecrecoverAuthenticator,
} from '../constants.js'
import type {
  AaAccountChangeConfig,
  AaAccountChangeCreate,
  AaAccountChangeDelegation,
  AaActor,
  AaActorChange,
  TransactionSerializable8130,
  TransactionSerialized8130,
} from '../types/transaction.js'
import { computeAddress8130 } from '../utils/computeAddress.js'
import { signActorChanges8130 } from '../utils/signActorChanges.js'
import { type Signer, signTransaction8130 } from '../utils/signTransaction.js'

export type To8130AccountParameters = {
  /** Signer for the controlling actor (produces `auth` / `sender_auth`). */
  signer: Signer
  /** User-chosen uniqueness factor (bytes32). */
  userSalt: Hex
  /** Runtime bytecode placed at the account address (e.g. ERC-1167 proxy). */
  code: Hex
  /**
   * Initial actors registered at creation. MUST be sorted by `actorId` in
   * strictly ascending order.
   */
  initialActors: readonly AaActor[]
  /**
   * Authenticator address used for this account's `auth` blobs. Defaults to the
   * native `ECRECOVER_AUTHENTICATOR`.
   */
  authenticator?: Address | undefined
  /** Account Configuration contract (CREATE2 deployer). */
  accountConfigAddress?: Address | undefined
  /** Override the derived account address. */
  address?: Address | undefined
}

export type To8130AccountReturnType = {
  readonly address: Address
  readonly signer: Signer
  readonly initialActors: readonly AaActor[]
  /** Builds the `create` account-change entry (place in the first transaction). */
  create(): AaAccountChangeCreate
  /** Signs an `authorizeActor` / `revokeActor` set into a `config` entry. */
  change(
    actorChanges: readonly AaActorChange[],
    options?: { chainId?: number; sequence?: number },
  ): Promise<AaAccountChangeConfig>
  /** Builds a `delegation` account-change entry. */
  delegate(target: Address): AaAccountChangeDelegation
  /** Signs an `AA_TX_TYPE` transaction as this account (configured-actor path). */
  signTransaction(
    transaction: TransactionSerializable8130,
    options?: {
      payer?: { account: Signer; address?: Address } | undefined
    },
  ): Promise<TransactionSerialized8130>
}

/**
 * Creates a local EIP-8130 account helper around a signer and an account
 * identity (`userSalt` + `code` + `initialActors`). Provides ergonomic builders
 * for the account lifecycle:
 *
 * - `create()` — the `create` account-change entry that deploys the account
 * - `change([...])` — a signed `config` entry (authorize / revoke actors)
 * - `delegate(target)` — a `delegation` entry
 * - `signTransaction(tx)` — signs an `AA_TX_TYPE` transaction as this account
 *
 * @example
 * import { to8130Account, key, authorizeActor, actorScope } from 'viem/experimental'
 *
 * const account = to8130Account({
 *   signer,
 *   userSalt,
 *   code: erc1167Bytecode(impl),
 *   initialActors: [key.k1(signer.address)],
 * })
 *
 * const create = account.create()
 * const change = await account.change([
 *   authorizeActor(key.p256({ x, y }), { scope: actorScope.sender }),
 * ])
 */
export function to8130Account(
  parameters: To8130AccountParameters,
): To8130AccountReturnType {
  const {
    signer,
    userSalt,
    code,
    initialActors,
    authenticator = ecrecoverAuthenticator,
    accountConfigAddress = defaultAccountConfigAddress,
  } = parameters

  const address =
    parameters.address ??
    computeAddress8130({ userSalt, code, initialActors, accountConfigAddress })

  return {
    address,
    signer,
    initialActors,

    create() {
      return { type: 'create', userSalt, code, initialActors }
    },

    async change(actorChanges, options = {}) {
      return signActorChanges8130({
        signer,
        account: address,
        chainId: options.chainId ?? 0,
        sequence: options.sequence ?? 0,
        actorChanges,
        authenticator,
      })
    },

    delegate(target) {
      return { type: 'delegation', target }
    },

    async signTransaction(transaction, options = {}) {
      if (!signer.sign)
        throw new BaseError('`signer` does not support raw signing.')
      return signTransaction8130({
        transaction: { ...transaction, from: transaction.from ?? address },
        account: signer,
        authenticator,
        payer: options.payer,
      })
    },
  }
}
