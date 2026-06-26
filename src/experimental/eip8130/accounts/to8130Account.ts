import type { Address } from 'abitype'
import { BaseError } from '../../../errors/base.js'
import type { Hex } from '../../../types/misc.js'
import { bytesToHex } from '../../../utils/encoding/toHex.js'
import { hexToBigInt } from '../../../utils/encoding/fromHex.js'
import {
  accountConfigAddress as defaultAccountConfigAddress,
  canonicalAuthenticators,
  ecrecoverAuthenticator,
} from '../constants.js'
import { canonicalEip8130Deployment } from '../deployments.js'
import { key } from '../keys.js'
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
import { erc1167Bytecode } from '../utils/proxy.js'
import { signActorChanges8130 } from '../utils/signActorChanges.js'
import { type Signer, signTransaction8130 } from '../utils/signTransaction.js'

/**
 * Common base params shared by both `to8130Account` shapes.
 * @internal
 */
type To8130AccountBase = {
  /** Signer that produces `sender_auth` / `auth` blobs for this account. */
  signer: Signer
  /**
   * Authenticator address for the signer's auth blobs. Defaults to the
   * native `ECRECOVER_AUTHENTICATOR` (secp256k1). Set to the P-256 /
   * WebAuthn / delegate authenticator address for non-K1 signers.
   */
  authenticator?: Address | undefined
}

/**
 * Parameters for `to8130Account` — two mutually exclusive shapes:
 *
 * **Smart-account shape** (`userSalt` + `code` + `initialActors`): derives the
 * counterfactual CREATE2 address and exposes `create()` for first-deployment.
 *
 * **Address shape** (`address` only): binds to a known address (e.g. an EOA that
 * will delegate via EIP-7702). `create()` is unavailable — use `delegate(impl)`
 * in the first transaction's `accountChanges` instead. No `userSalt`, `code`, or
 * `initialActors` are needed.
 */
export type To8130AccountParameters = To8130AccountBase &
  (
    | {
        /**
         * User-chosen uniqueness factor (bytes32). Required to derive the
         * counterfactual CREATE2 address.
         */
        userSalt: Hex
        /** Runtime bytecode placed at the account address (ERC-1167 proxy). */
        code: Hex
        /**
         * Initial actors registered at creation, sorted by `actorId` in strictly
         * ascending order.
         */
        initialActors: readonly AaActor[]
        /** Account Configuration contract (CREATE2 deployer). Defaults to canonical. */
        accountConfigAddress?: Address | undefined
        /** Override the derived address (advanced). */
        address?: Address | undefined
      }
    | {
        /**
         * A known account address — e.g. an EOA address for EIP-7702 delegation.
         * When provided, `userSalt`, `code`, and `initialActors` are not needed
         * and `create()` is not available. Use `delegate(impl)` in the first
         * transaction's `accountChanges` to install delegation code.
         */
        address: Address
        userSalt?: undefined
        code?: undefined
        initialActors?: undefined
        accountConfigAddress?: undefined
      }
  )

export type To8130AccountReturnType = {
  readonly address: Address
  readonly signer: Signer
  readonly initialActors: readonly AaActor[]
  /**
   * Builds the `create` account-change entry (include in the first tx for
   * smart accounts). Throws if the account was constructed with a known `address`
   * (e.g. delegated EOA) — use `delegate(impl)` instead.
   */
  create(): AaAccountChangeCreate
  /** Signs an `authorizeActor` / `revokeActor` set into a `config` entry. */
  change(
    actorChanges: readonly AaActorChange[],
    options?: { chainId?: number; sequence?: number },
  ): Promise<AaAccountChangeConfig>
  /**
   * Builds an EIP-7702 `delegation` account-change entry.
   * Include in the first transaction's `accountChanges` for delegated EOA accounts.
   */
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
 * Creates a local EIP-8130 account helper for the **configured-actor** signing
 * path (authenticator-prefixed `senderAuth`). Two shapes:
 *
 * **Smart-account** — supply `userSalt + code + initialActors`:
 * ```ts
 * const account = to8130Account({ signer, userSalt, code, initialActors })
 * // first tx: accountChanges: [account.create()]
 * ```
 *
 * **Delegated EOA** — supply `address` only (no salt, no code, no actors):
 * ```ts
 * const account = to8130Account({ signer, address: eoaSigner.address })
 * // first tx: accountChanges: [account.delegate(deployment.accounts.default)]
 * // add keys:  accountChanges: [account.delegate(...), await account.change([...])]
 * ```
 *
 * For the P256 / WebAuthn actor to drive the EOA after delegation, construct
 * a second handle with the new signer but the same `address`:
 * ```ts
 * const accountAsP256 = to8130Account({
 *   signer: p256,
 *   authenticator: p256.authenticator,
 *   address: eoaSigner.address,
 * })
 * ```
 *
 * For pure EOA K1 signing (no contract, raw 65-byte sig) see {@link toEoa8130Account}.
 * For a new smart account with auto-derived address see {@link newSmartAccount8130}.
 */
export function to8130Account(
  parameters: To8130AccountParameters,
): To8130AccountReturnType {
  const {
    signer,
    authenticator = ecrecoverAuthenticator,
  } = parameters

  // Address-only mode (delegated EOA): address is fixed, no CREATE2 derivation.
  const isAddressOnly = parameters.userSalt === undefined

  const address: Address = (() => {
    if (parameters.address) return parameters.address
    if (isAddressOnly)
      throw new BaseError(
        'Provide `address` or `userSalt + code + initialActors` to derive the account address.',
      )
    return computeAddress8130({
      userSalt: parameters.userSalt!,
      code: parameters.code!,
      initialActors: parameters.initialActors!,
      accountConfigAddress:
        (parameters as { accountConfigAddress?: Address }).accountConfigAddress ??
        defaultAccountConfigAddress,
    })
  })()

  const initialActors = parameters.initialActors ?? []

  return {
    address,
    signer,
    initialActors,

    create() {
      if (isAddressOnly)
        throw new BaseError(
          '`create()` is not available for address-only (delegated EOA) accounts. ' +
            'Include `account.delegate(impl)` in `accountChanges` instead.',
        )
      return {
        type: 'create',
        userSalt: parameters.userSalt!,
        code: parameters.code!,
        initialActors: parameters.initialActors!,
      }
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

// ─────────────────────────────────────────────────────────────────────────────
// newSmartAccount8130
// ─────────────────────────────────────────────────────────────────────────────

export type NewSmartAccount8130Parameters = {
  /**
   * The signing key for this account's controlling actor.
   *
   * - **K1 (secp256k1)** — a `LocalAccount` from `privateKeyToAccount(pk)`
   * - **P-256** — from `toP256Signer({ privateKey })`
   * - **WebAuthn / passkey** — from `toWebAuthnSigner(toWebAuthnAccount({ credential }))`
   *
   * The signer's type is detected automatically: K1 signers expose `.address`;
   * P-256 / WebAuthn signers expose `.publicKey` and `.authenticator`.
   */
  signer: Signer & { publicKey?: { x: Hex; y: Hex } }
  /**
   * Uniqueness factor for CREATE2 (bytes32). Randomly generated if omitted.
   * Pass the same salt across sessions to recover a deterministic address.
   */
  salt?: Hex | undefined
  /**
   * Wallet implementation address (proxied via ERC-1167).
   * Defaults to the canonical `DefaultAccount`.
   * Ignored if `code` is provided.
   */
  implementation?: Address | undefined
  /**
   * Deployment bytecode override. Defaults to `erc1167Bytecode(implementation)`
   * (or the canonical `DefaultAccount` implementation if neither is provided).
   */
  code?: Hex | undefined
  /**
   * Additional actors to include at account creation alongside the signer's own
   * actor. All actors are sorted by `actorId` in strictly ascending order (as
   * required by the protocol).
   */
  extraActors?: readonly AaActor[] | undefined
  /** AccountConfiguration contract override (advanced). Defaults to canonical. */
  accountConfigAddress?: Address | undefined
}

export type NewSmartAccount8130ReturnType = To8130AccountReturnType & {
  /**
   * The `create` account-change entry — include in `accountChanges` for the
   * first transaction to deploy this account.
   *
   * @example
   * const gas = await estimateGas8130(client, {
   *   from: account.address,
   *   accountChanges: [account.createChange],
   *   calls: [[{ to: recipient, value: parseEther('0.01') }]],
   * })
   * const tx = await account.signTransaction({
   *   accountChanges: [account.createChange],
   *   calls: wire,
   *   gas: (gas * 120n) / 100n,
   *   ...
   * })
   */
  readonly createChange: AaAccountChangeCreate
}

/**
 * Creates a new EIP-8130 smart account from a signer, automatically deriving
 * the actor type, deployment bytecode, and counterfactual address. The account
 * is not yet deployed on-chain — include `account.createChange` in the first
 * transaction's `accountChanges` to atomically deploy and call in one shot.
 *
 * Supports K1 (secp256k1), P-256, and WebAuthn (passkey) signers, detected
 * automatically from the signer object.
 *
 * @example
 * // K1 (EOA private key)
 * const account = newSmartAccount8130({ signer: privateKeyToAccount(pk) })
 *
 * @example
 * // P-256
 * const p256 = toP256Signer({ privateKey: P256.randomPrivateKey() })
 * const account = newSmartAccount8130({ signer: p256 })
 *
 * @example
 * // WebAuthn / passkey
 * const webAuthn = toWebAuthnSigner(toWebAuthnAccount({ credential }))
 * const account = newSmartAccount8130({ signer: webAuthn })
 *
 * @example
 * // First tx: create + call in one shot
 * const gas = await estimateGas8130(client, {
 *   from: account.address,
 *   accountChanges: [account.createChange],
 *   calls: [[{ to: recipient, value }]],
 *   senderAuthScheme: 'secp256k1',
 * })
 * const signed = await account.signTransaction({
 *   chainId, nonceKey: 0n, nonceSequence: 0n,
 *   accountChanges: [account.createChange],
 *   calls: wire,
 *   gas: (gas * 120n) / 100n,
 *   maxFeePerGas: 1_000_000_000n,
 *   maxPriorityFeePerGas: 1_000_000n,
 * })
 */
export function newSmartAccount8130(
  parameters: NewSmartAccount8130Parameters,
): NewSmartAccount8130ReturnType {
  const { signer, implementation, extraActors = [], accountConfigAddress } = parameters

  // Detect signer type and derive the primary actor.
  // P256 / WebAuthn signers expose `.publicKey`; K1 signers have `.address`.
  const primaryActor: AaActor =
    'publicKey' in signer && signer.publicKey
      ? signer.authenticator === canonicalAuthenticators.passkey
        ? key.webAuthn(signer.publicKey)
        : key.p256(signer.publicKey)
      : key.k1(signer.address)

  // Sort all actors by actorId (strictly ascending — protocol requirement).
  const allActors: AaActor[] = [primaryActor, ...extraActors].sort((a, b) => {
    const ai = hexToBigInt(a.actorId as Hex)
    const bi = hexToBigInt(b.actorId as Hex)
    return ai < bi ? -1 : ai > bi ? 1 : 0
  })

  const salt = parameters.salt ?? randomBytes32()

  const code =
    parameters.code ??
    erc1167Bytecode(
      implementation ?? canonicalEip8130Deployment.accounts.default,
    )

  const inner = to8130Account({
    signer,
    userSalt: salt,
    code,
    initialActors: allActors,
    authenticator: signer.authenticator,
    accountConfigAddress,
  })

  return { ...inner, createChange: inner.create() }
}

// ─────────────────────────────────────────────────────────────────────────────
// toEoa8130Account
// ─────────────────────────────────────────────────────────────────────────────

export type ToEoa8130AccountReturnType = {
  /** The EOA address — both the sender identity and the key recovery target. */
  readonly address: Address
  readonly signer: Signer
  /**
   * Builds an EIP-7702 `delegation` account-change entry that sets the code
   * at this EOA address. Include in the first transaction's `accountChanges`
   * to enable smart-account execution (e.g. `executeBatch`, multi-actor auth).
   *
   * @example
   * await account.signTransaction({
   *   accountChanges: [account.delegate(deployment.accounts.default)],
   *   calls: wire, ...
   * })
   */
  delegate(target: Address): AaAccountChangeDelegation
  /**
   * Signs an `authorizeActor` / `revokeActor` set into a `config` account-change
   * entry. Use to add P-256 / WebAuthn keys or remove the K1 actor after
   * delegation without needing a separate account handle.
   *
   * @example
   * // Atomically delegate + add a P256 key in the first tx:
   * const addP256 = await account.change([
   *   authorizeActor(key.p256(p256.publicKey), { scope: actorScope.sender }),
   * ], { chainId, sequence: 0 })
   * await account.signTransaction({
   *   accountChanges: [account.delegate(impl), addP256],
   *   calls: wire, ...
   * })
   */
  change(
    actorChanges: readonly AaActorChange[],
    options?: { chainId?: number; sequence?: number },
  ): Promise<AaAccountChangeConfig>
  /**
   * Signs an EIP-8130 transaction using the EOA implicit self-actor path.
   *
   * `senderAuth` is a **raw 65-byte secp256k1 signature** — no authenticator
   * address prefix, no `from` field in the tx body. The node recovers the sender
   * via `ecrecover` and validates it as the implicit K1 self-actor. This is the
   * cheapest auth path and works for both plain-EOA and delegated-EOA cases.
   */
  signTransaction(
    transaction: TransactionSerializable8130,
    options?: {
      payer?: { account: Signer; address?: Address } | undefined
    },
  ): Promise<TransactionSerialized8130>
}

/**
 * Wraps a secp256k1 EOA signer for EIP-8130 transactions using the **implicit
 * self-actor** path. `senderAuth` is a raw 65-byte ECDSA signature (no
 * authenticator prefix, no `from` field); the node recovers the sender via
 * `ecrecover`.
 *
 * Use this when the EOA key IS the account — whether the EOA is undelegated
 * (pure K1, no contract) or delegated via EIP-7702 (use `delegate(impl)` in
 * the first tx's `accountChanges`). Both cases use the same signing path.
 *
 * To drive the same EOA address with a **different** actor (P-256 / WebAuthn)
 * after delegation, use {@link to8130Account} with `address`:
 * ```ts
 * const accountAsP256 = to8130Account({
 *   signer: p256,
 *   authenticator: p256.authenticator,
 *   address: eoaSigner.address,
 * })
 * ```
 *
 * @example
 * // Pure EOA — no contract, payer-sponsored
 * const account = toEoa8130Account(privateKeyToAccount(pk))
 * const signed = await account.signTransaction({ calls: wire, payer: payerAddr, ... })
 *
 * @example
 * // Delegated EOA — delegate + add P256 in one shot
 * const account = toEoa8130Account(privateKeyToAccount(pk))
 * const addP256 = await account.change([authorizeActor(key.p256(...))], { chainId, sequence: 0 })
 * const signed = await account.signTransaction({
 *   accountChanges: [account.delegate(deployment.accounts.default), addP256],
 *   calls: wire, ...
 * })
 */
export function toEoa8130Account(signer: Signer): ToEoa8130AccountReturnType {
  if (!signer.address)
    throw new BaseError(
      '`signer.address` is required. Use `privateKeyToAccount(pk)` or equivalent.',
    )
  const address = signer.address

  return {
    address,
    signer,

    delegate(target) {
      return { type: 'delegation', target }
    },

    async change(actorChanges, options = {}) {
      return signActorChanges8130({
        signer,
        account: address,
        chainId: options.chainId ?? 0,
        sequence: options.sequence ?? 0,
        actorChanges,
        authenticator: ecrecoverAuthenticator,
      })
    },

    async signTransaction(transaction, options = {}) {
      if (!signer.sign)
        throw new BaseError('`signer` does not support raw signing.')
      return signTransaction8130({
        // Omit `from` → EOA implicit self-actor path:
        // senderAuth = raw 65-byte sig, sender recovered via ecrecover.
        transaction,
        account: signer,
        authenticator: ecrecoverAuthenticator,
        payer: options.payer,
      })
    },
  }
}

/** Generates a cryptographically random bytes32 salt. */
function randomBytes32(): Hex {
  const buf = new Uint8Array(32)
  globalThis.crypto.getRandomValues(buf)
  return bytesToHex(buf)
}
