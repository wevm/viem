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
  /** The EOA address — used as both `sender` and signer identity. */
  readonly address: Address
  readonly signer: Signer
  /**
   * Signs an EIP-8130 transaction as a bare EOA (implicit self-actor).
   *
   * The `senderAuth` is a raw 65-byte secp256k1 signature with no authenticator
   * prefix — the node recovers the sender address directly via `ecrecover`.
   * Use this when you want native EIP-8130 features (e.g. payer sponsorship)
   * without deploying a smart-contract account.
   */
  signTransaction(
    transaction: TransactionSerializable8130,
    options?: {
      payer?: { account: Signer; address?: Address } | undefined
    },
  ): Promise<TransactionSerialized8130>
}

/**
 * Wraps a secp256k1 EOA signer for EIP-8130 transactions using the implicit
 * self-actor path. The `senderAuth` is a raw 65-byte ECDSA signature (no
 * authenticator prefix); the node recovers the sender via `ecrecover`.
 *
 * Use this when your EOA address IS the account — no smart contract deployment
 * needed. The signer can still receive payer sponsorship and use all other
 * EIP-8130 features.
 *
 * For smart contract accounts (create / delegate / configure), use
 * {@link newSmartAccount8130} or {@link to8130Account} instead.
 *
 * @example
 * const eoa = toEoa8130Account(privateKeyToAccount(pk))
 *
 * const signed = await eoa.signTransaction({
 *   chainId, nonceKey: 0n, nonceSequence: 0n,
 *   calls: wire,
 *   gas: gasLimit,
 *   maxFeePerGas: 1_000_000_000n,
 *   maxPriorityFeePerGas: 1_000_000n,
 *   // No `from` → raw 65-byte EOA auth
 * })
 */
export function toEoa8130Account(signer: Signer): ToEoa8130AccountReturnType {
  if (!signer.address)
    throw new BaseError(
      '`signer.address` is required for an EOA account. Use `privateKeyToAccount(pk)` or equivalent.',
    )
  const address = signer.address

  return {
    address,
    signer,

    async signTransaction(transaction, options = {}) {
      if (!signer.sign)
        throw new BaseError('`signer` does not support raw signing.')
      return signTransaction8130({
        // Do NOT set `from` — signals the EOA path: raw 65-byte sig, no prefix.
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
