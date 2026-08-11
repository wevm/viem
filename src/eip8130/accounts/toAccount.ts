import type { Address } from 'abitype'
import { BaseError } from '../../errors/base.js'
import type { Hex } from '../../types/misc.js'
import { concatHex } from '../../utils/data/concat.js'
import { hexToBigInt } from '../../utils/encoding/fromHex.js'
import { bytesToHex } from '../../utils/encoding/toHex.js'
import {
  canonicalAuthenticators,
  accountConfigAddress as defaultAccountConfigAddress,
  ecrecoverAuthenticator,
  scopeUnrestricted,
} from '../constants.js'
import { canonicalEip8130Deployment } from '../deployments.js'
import { key } from '../keys.js'
import type {
  AaAccountChangeConfig,
  AaAccountChangeCreate,
  AaAccountChangeDelegation,
  AaActor,
  AaChange,
  AaChangeChannel,
  TransactionSerializable8130,
  TransactionSerialized8130,
} from '../types/transaction.js'
import { computeAddress } from '../utils/computeAddress.js'
import { erc1167Bytecode, upgradeableProxyBytecode } from '../utils/proxy.js'
import { signAccountChanges } from '../utils/signActorChanges.js'
import { type Signer, signTransaction } from '../utils/signTransaction.js'

/**
 * Common base params shared by both `toAccount` shapes.
 * @internal
 */
type ToAccountBase = {
  /** Signer that produces `sender_auth` / `auth` blobs for this account. */
  signer: Signer
  /**
   * Authenticator address for the signer's auth blobs. Defaults to the
   * native `ECRECOVER_AUTHENTICATOR` (secp256k1). Set to the P-256 /
   * WebAuthn / delegate authenticator address for non-K1 signers.
   */
  authenticator?: Address | undefined
  /**
   * Scope bitmask of the **signing actor** on this account (see
   * {@link actorScope}). Prefer omitting this once the actor is on-chain —
   * {@link prepareTransaction} reads `getActorConfig` and derives nonce
   * mode from chain truth. When set on an already-bound actor, it must match
   * the on-chain value or prepare throws {@link ScopeMismatchError}.
   *
   * Still useful before the actor is bound (e.g. the create tx for an admin
   * owner): pass {@link scopeUnrestricted} so nonce-free mode is selected.
   */
  scope?: number | undefined
  /**
   * 32-byte actor id of the signing actor. Defaults to `key.k1(signer.address)`
   * when the authenticator is the native ecrecover / K1 authenticator. Required
   * for P-256 / passkey / delegate signers so prepare can read on-chain scope.
   */
  actorId?: Hex | undefined
}

/**
 * Parameters for `toAccount` — two mutually exclusive shapes:
 *
 * **Smart-account shape** (`userSalt` + `code` + `initialActors`): derives the
 * counterfactual CREATE2 address and exposes `create()` for first-deployment.
 *
 * **Address shape** (`address` only): binds to a known address (e.g. an EOA that
 * will delegate via EIP-7702). `create()` is unavailable — use `delegate(impl)`
 * in the first transaction's `accountChanges` instead. No `userSalt`, `code`, or
 * `initialActors` are needed.
 */
export type ToAccountParameters = ToAccountBase &
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
        /** AccountConfiguration for on-chain actor reads. Defaults to canonical. */
        accountConfigAddress?: Address | undefined
      }
  )

export type ToAccountReturnType = {
  readonly address: Address
  readonly signer: Signer
  readonly initialActors: readonly AaActor[]
  /**
   * Scope of the signing actor, when known off-chain. Prefer leaving this
   * unset once the actor is authorized — prepare reads chain truth instead.
   * See {@link prepareTransaction}.
   */
  readonly scope?: number | undefined
  /**
   * Actor id used for on-chain scope lookup / auth. Derived for K1 signers;
   * set explicitly for non-K1 authenticators.
   */
  readonly actorId?: Hex | undefined
  /** AccountConfiguration address used for on-chain actor reads (when known). */
  readonly accountConfigAddress?: Address | undefined
  /**
   * Builds the `create` account-change entry (include in the first tx for
   * smart accounts). Throws if the account was constructed with a known `address`
   * (e.g. delegated EOA) — use `delegate(impl)` instead.
   */
  create(): AaAccountChangeCreate
  /** Signs a `SignedAccountChanges` batch into a `config` entry. */
  change(
    changes: readonly AaChange[],
    options?: {
      channel?: AaChangeChannel
      chainId?: number
      sequence?: bigint
    },
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
 * const account = toAccount({ signer, userSalt, code, initialActors })
 * // first tx: accountChanges: [account.create()]
 * ```
 *
 * **Delegated EOA** — supply `address` only (no salt, no code, no actors):
 * ```ts
 * const account = toAccount({ signer, address: eoaSigner.address })
 * // first tx: accountChanges: [account.delegate(deployment.accounts.default)]
 * // add keys:  accountChanges: [account.delegate(...), await account.change([...])]
 * ```
 *
 * For the P256 / WebAuthn actor to drive the EOA after delegation, construct
 * a second handle with the new signer but the same `address`:
 * ```ts
 * const accountAsP256 = toAccount({
 *   signer: p256,
 *   authenticator: p256.authenticator,
 *   address: eoaSigner.address,
 * })
 * ```
 *
 * For pure EOA K1 signing (no contract, raw 65-byte sig) see {@link toEoaAccount}.
 * For a new smart account with auto-derived address see {@link newSmartAccount}.
 */
export function toAccount(
  parameters: ToAccountParameters,
): ToAccountReturnType {
  const { signer, authenticator = ecrecoverAuthenticator, scope } = parameters

  // Address-only mode (delegated EOA): address is fixed, no CREATE2 derivation.
  const isAddressOnly = parameters.userSalt === undefined

  const accountConfigAddress =
    parameters.accountConfigAddress ?? defaultAccountConfigAddress

  const address: Address = (() => {
    if (parameters.address) return parameters.address
    if (isAddressOnly)
      throw new BaseError(
        'Provide `address` or `userSalt + code + initialActors` to derive the account address.',
      )
    return computeAddress({
      userSalt: parameters.userSalt!,
      code: parameters.code!,
      initialActors: parameters.initialActors!,
      accountConfigAddress,
    })
  })()

  const initialActors = parameters.initialActors ?? []

  // K1 / ecrecover signers: actorId is a pure function of the signer address.
  // Non-K1 authenticators must pass `actorId` explicitly for on-chain scope reads.
  const isK1Authenticator =
    authenticator === ecrecoverAuthenticator ||
    authenticator === canonicalAuthenticators.k1
  const actorId =
    parameters.actorId ??
    (isK1Authenticator ? key.k1(signer.address).actorId : undefined)

  return {
    address,
    signer,
    initialActors,
    scope,
    actorId,
    accountConfigAddress,

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

    async change(changes, options = {}) {
      return signAccountChanges({
        signer,
        account: address,
        channel: options.channel ?? 'local',
        chainId: options.chainId ?? 0,
        sequence: options.sequence ?? 0n,
        changes,
        authenticator,
      })
    },

    delegate(target) {
      return { type: 'delegation', target }
    },

    async signTransaction(transaction, options = {}) {
      if (!signer.sign)
        throw new BaseError('`signer` does not support raw signing.')
      return signTransaction({
        transaction: { ...transaction, from: transaction.from ?? address },
        account: signer,
        authenticator,
        payer: options.payer,
      })
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// newSmartAccount
// ─────────────────────────────────────────────────────────────────────────────

export type NewSmartAccountParameters = {
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
   * When `false` (default), the account is deployed as an ERC-1167 proxy to the
   * canonical `DefaultAccount`. When `true`, `implementation` is required and
   * is deployed behind an ERC-1967 `UpgradeableProxy`. Ignored if `code` is
   * provided.
   */
  upgradeable?: boolean | undefined
  /**
   * Wallet implementation address the account proxies to. Defaults to the
   * canonical `DefaultAccount` when `upgradeable` is `false`. Required when
   * `upgradeable` is `true`. Ignored if `code` is provided.
   */
  implementation?: Address | undefined
  /**
   * Deployment bytecode override. Defaults to `upgradeableProxyBytecode(implementation)`
   * (or `erc1167Bytecode(implementation)` when `upgradeable` is `false`).
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

export type NewSmartAccountReturnType = ToAccountReturnType & {
  /**
   * The `create` account-change entry — include in `accountChanges` for the
   * first transaction to deploy this account.
   *
   * @example
   * const gas = await estimateGas(client, {
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
 * is not yet deployed onchain — include `account.createChange` in the first
 * transaction's `accountChanges` to atomically deploy and call in one shot.
 *
 * Supports K1 (secp256k1), P-256, and WebAuthn (passkey) signers, detected
 * automatically from the signer object.
 *
 * @example
 * // K1 (EOA private key)
 * const account = newSmartAccount({ signer: privateKeyToAccount(pk) })
 *
 * @example
 * // P-256
 * const p256 = toP256Signer({ privateKey: P256.randomPrivateKey() })
 * const account = newSmartAccount({ signer: p256 })
 *
 * @example
 * // WebAuthn / passkey
 * const webAuthn = toWebAuthnSigner(toWebAuthnAccount({ credential }))
 * const account = newSmartAccount({ signer: webAuthn })
 *
 * @example
 * // First tx: create + call in one shot
 * const gas = await estimateGas(client, {
 *   from: account.address,
 *   accountChanges: [account.createChange],
 *   calls: [[{ to: recipient, value }]],
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
export function newSmartAccount(
  parameters: NewSmartAccountParameters,
): NewSmartAccountReturnType {
  const {
    signer,
    implementation,
    upgradeable = false,
    extraActors = [],
    accountConfigAddress,
  } = parameters

  // Detect signer type and derive the primary actor.
  // P256 / WebAuthn signers expose an `{ x, y }` public key. K1 local accounts
  // may also expose `.publicKey`, but as a 65-byte SEC1 hex string.
  const primaryActor: AaActor =
    'publicKey' in signer &&
    signer.publicKey &&
    typeof signer.publicKey !== 'string'
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

  // Canonical accounts use an ERC-1167 proxy to DefaultAccount. Upgradeability
  // remains available only when the caller explicitly supplies an implementation.
  let code = parameters.code
  if (!code) {
    if (upgradeable) {
      if (!implementation)
        throw new BaseError(
          '`implementation` is required for `upgradeable: true`; the canonical deployment does not include the unaudited UpgradeableAccount example.',
        )
      code = upgradeableProxyBytecode(implementation)
    } else {
      code = erc1167Bytecode(
        implementation ?? canonicalEip8130Deployment.accounts.default,
      )
    }
  }

  const inner = toAccount({
    signer,
    userSalt: salt,
    code,
    initialActors: allActors,
    authenticator: signer.authenticator,
    accountConfigAddress,
    // The primary (controlling) actor is registered without a scope, i.e. as an
    // admin actor (`scopeUnrestricted`). Admin actors may use ordered *or*
    // nonce-free nonces, so sends default to ordered (sequenced) mode — surface
    // the scope so nonce mode is selected automatically.
    scope: primaryActor.scope ?? scopeUnrestricted,
  })

  return { ...inner, createChange: inner.create() }
}

// ─────────────────────────────────────────────────────────────────────────────
// toEoaAccount
// ─────────────────────────────────────────────────────────────────────────────

export type ToEoaAccountParameters = {
  /**
   * Scope of the EOA's implicit self-actor. Defaults to admin
   * ({@link scopeUnrestricted}), which may use ordered *or* nonce-free nonces
   * (sends default to ordered). Override for a restricted self-actor.
   */
  scope?: number | undefined
}

export type ToEoaAccountReturnType = {
  /** The EOA address — both the sender identity and the key recovery target. */
  readonly address: Address
  readonly signer: Signer
  /**
   * Scope of the implicit self-actor (admin by default). Drives automatic
   * nonce-mode selection: admin may use ordered *or* nonce-free, so sends
   * default to ordered (sequenced) mode. See {@link prepareTransaction}.
   */
  readonly scope?: number | undefined
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
    changes: readonly AaChange[],
    options?: {
      channel?: AaChangeChannel
      chainId?: number
      sequence?: bigint
    },
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
 * after delegation, use {@link toAccount} with `address`:
 * ```ts
 * const accountAsP256 = toAccount({
 *   signer: p256,
 *   authenticator: p256.authenticator,
 *   address: eoaSigner.address,
 * })
 * ```
 *
 * @example
 * // Pure EOA — no contract, payer-sponsored
 * const account = toEoaAccount(privateKeyToAccount(pk))
 * const signed = await account.signTransaction({ calls: wire, payer: payerAddr, ... })
 *
 * @example
 * // Delegated EOA — delegate + add P256 in one shot
 * const account = toEoaAccount(privateKeyToAccount(pk))
 * const addP256 = await account.change([authorizeActor(key.p256(...))], { chainId, sequence: 0 })
 * const signed = await account.signTransaction({
 *   accountChanges: [account.delegate(deployment.accounts.default), addP256],
 *   calls: wire, ...
 * })
 */
export function toEoaAccount(
  signer: Signer,
  parameters: ToEoaAccountParameters = {},
): ToEoaAccountReturnType {
  if (!signer.address)
    throw new BaseError(
      '`signer.address` is required. Use `privateKeyToAccount(pk)` or equivalent.',
    )
  const address = signer.address
  const scope = parameters.scope ?? scopeUnrestricted

  return {
    address,
    signer,
    scope,

    delegate(target) {
      return { type: 'delegation', target }
    },

    async change(changes, options = {}) {
      return signAccountChanges({
        signer,
        account: address,
        channel: options.channel ?? 'local',
        chainId: options.chainId ?? 0,
        sequence: options.sequence ?? 0n,
        changes,
        authenticator: ecrecoverAuthenticator,
      })
    },

    async signTransaction(transaction, options = {}) {
      if (!signer.sign)
        throw new BaseError('`signer` does not support raw signing.')
      return signTransaction({
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

// ─────────────────────────────────────────────────────────────────────────────
// toDelegateSigner
// ─────────────────────────────────────────────────────────────────────────────

export type ToDelegateSignerParameters = {
  /**
   * The delegate (parent) account address that controls the sub-account. The
   * sub-account must have a `key.delegate(delegateAccount)` actor authorized
   * (its `actorId` is `bytes32(bytes20(delegateAccount))`).
   */
  delegateAccount: Address
  /**
   * A signer for an **admin** (scope `0x00`) actor of the delegate (parent)
   * account — the nested signature must resolve to an admin, or the
   * `DelegateAuthenticator` rejects the vouch (`InvalidNestedSignature`).
   */
  nestedSigner: Signer
  /**
   * Authenticator of the nested (parent admin) signer. Defaults to the native
   * `ECRECOVER_AUTHENTICATOR` (secp256k1). Set to the P-256 / WebAuthn
   * authenticator when the parent admin actor is non-K1.
   */
  nestedAuthenticator?: Address | undefined
  /** DelegateAuthenticator address. Defaults to the canonical deployment. */
  authenticator?: Address | undefined
}

/**
 * Wraps a **parent admin** signer into a {@link Signer} that authenticates a
 * sub-account through the `DelegateAuthenticator` (one delegation hop). The
 * produced `sign` returns the delegate authenticator's `data` payload —
 * `delegateAccount(20) ‖ nestedAuthenticator(20) ‖ nestedSignature` — so that
 * `toAccount`'s configured-actor path serializes the full `senderAuth` as
 * `DELEGATE_AUTHENTICATOR ‖ data`.
 *
 * Use it as the `signer` (and pass its `authenticator`) to {@link toAccount}
 * for an account whose only owner is `key.delegate(parent)`:
 * ```ts
 * const delegateSigner = toDelegateSigner({
 *   delegateAccount: parent.address,
 *   nestedSigner: parentAdmin, // an admin (scope 0) owner of the parent
 * })
 * const sub = toAccount({
 *   signer: delegateSigner,
 *   authenticator: delegateSigner.authenticator, // DelegateAuthenticator
 *   userSalt, code,
 *   initialActors: [key.delegate(parent.address)],
 * })
 * // sub.signTransaction(...) now produces a valid delegate senderAuth.
 * ```
 *
 * The parent account MUST be deployed (its admin actor config must be on-chain)
 * before the delegate vouch can be validated.
 */
export function toDelegateSigner(
  parameters: ToDelegateSignerParameters,
): Signer {
  const {
    delegateAccount,
    nestedSigner,
    nestedAuthenticator = ecrecoverAuthenticator,
    authenticator = canonicalAuthenticators.delegate,
  } = parameters
  if (!nestedSigner.sign)
    throw new BaseError('`nestedSigner` must support raw signing.')
  return {
    address: nestedSigner.address,
    authenticator,
    async sign({ hash }) {
      const nestedSignature = await nestedSigner.sign!({ hash })
      // DelegateAuthenticator `data` layout (bytes after the 20-byte selector):
      //   delegate_address(20) || nested_authenticator(20) || nested_data
      return concatHex([delegateAccount, nestedAuthenticator, nestedSignature])
    },
  }
}

/**
 * Byte length of a delegate `senderAuth`/`auth` blob for a given nested-auth
 * payload length (default: 65-byte K1 signature). Useful as `senderAuthSize` /
 * `payerAuthSize` when estimating gas for a delegate-signed transaction, since
 * the delegate authenticator has no fixed default length.
 *
 * Layout: DELEGATE_AUTHENTICATOR(20) ‖ delegate_address(20) ‖ nested_auth(20) ‖ nested_data.
 */
export function delegateAuthSize(nestedDataLength = 65): number {
  return 20 + 20 + 20 + nestedDataLength
}

/** Generates a cryptographically random bytes32 salt. */
function randomBytes32(): Hex {
  const buf = new Uint8Array(32)
  globalThis.crypto.getRandomValues(buf)
  return bytesToHex(buf)
}
