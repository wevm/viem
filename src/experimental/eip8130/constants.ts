import type { Hex } from '../../types/misc.js'

/**
 * EIP-2718 transaction type for EIP-8130 AA transactions (`AA_TX_TYPE`).
 */
export const aaTransactionType = '0x79' satisfies Hex

/**
 * Magic byte for payer signature domain separation (`AA_PAYER_TYPE`).
 */
export const aaPayerType = '0x7a' satisfies Hex

/** Base intrinsic gas cost (`AA_BASE_COST`). */
export const aaBaseCost = 15000n

/**
 * `nonce_key_cost` for nonce-free (`NONCE_KEY_MAX`) transactions: 13,000 gas for
 * the enshrined ring-buffer replay state (2·COLD_SLOAD + WARM_SLOAD +
 * 3·SSTORE_RESET). Base's current schedule; a chain MAY price differently.
 */
export const nonceFreeCost = 13000n

/** `nonce_key_cost` for the first use of a sequenced nonce key (cold SLOAD + SSTORE set). */
export const nonceKeyFirstUseCost = 22100n

/** `nonce_key_cost` for a previously-used sequenced nonce key (cold SLOAD + SSTORE reset). */
export const nonceKeyExistingCost = 5000n

/**
 * Domain-separation prefix for the nonce-free `replay_id` preimage
 * (`REPLAY_ID_TYPE`): `keccak256(REPLAY_ID_TYPE || rlp([chain_id,
 * resolved_sender, expiry, account_changes, calls, metadata, payer]))`.
 */
export const replayIdType = '0x7901' satisfies Hex

/**
 * Consensus/execution replay window (seconds) for nonce-free transactions
 * (`NONCE_FREE_EXPIRY_WINDOW`). A nonce-free tx's `expiry` must fall within
 * `(now, now + NONCE_FREE_EXPIRY_WINDOW]`.
 */
export const nonceFreeExpiryWindow = 30n

/**
 * Mempool-admission cap (seconds) on a nonce-free tx's `expiry` window
 * (`NONCE_FREE_MAX_EXPIRY_WINDOW`); tighter than the consensus window.
 */
export const nonceFreeMaxExpiryWindow = 10n

/** Enshrined nonce-free replay ring-buffer capacity (`REPLAY_BUFFER_CAPACITY`). */
export const replayBufferCapacity = 300000n

/**
 * Account change entry type discriminators — the first element of each
 * `account_changes` entry's flat RLP list `rlp([type_byte, ...fields])`.
 *
 * The discriminant is RLP-encoded as an integer (`u8`), so `create` (`0`) is the
 * canonical empty item `'0x'` (which RLP-encodes to `0x80`), not `'0x00'`.
 */
export const accountChangeType = {
  create: '0x',
  config: '0x01',
  delegation: '0x02',
} as const satisfies Record<string, Hex>

/**
 * Actor change operation types used within a config-change entry.
 */
export const actorChangeType = {
  authorizeActor: 0x01,
  revokeActor: 0x02,
} as const

/**
 * Actor scope permission bitmask values (base/eip-8130 `AccountConfiguration`).
 *
 * `0x00` (unrestricted) is admin: an actor is admin iff `scope == 0`. There is
 * no `SCOPE_SIGNATURE` / `SCOPE_CONFIG` bit — ERC-1271 signing and config rights
 * ride on admin scope (or a SENDER actor without POLICY). Bits `0x20`, `0x40`,
 * `0x80` are spare.
 */
export const actorScope = {
  /** `SCOPE_SENDER` — may originate transactions with the account as sender. */
  sender: 0x01,
  /** `SCOPE_POLICY` — actor is gated to its policy manager; a bit in the scope word (replaces the old `policyType` field). */
  policy: 0x02,
  /** `SCOPE_NONCE` — may use sequenced nonce keys; without it, restricted to nonce-free (`NONCE_KEY_MAX`). */
  nonce: 0x04,
  /** `SCOPE_SELF_PAYER` — may pay for its own transactions (`payer == sender`). */
  selfPayer: 0x08,
  /** `SCOPE_SPONSOR_PAYER` — may sponsor others (`payer != sender`). */
  sponsorPayer: 0x10,
} as const

/** Unrestricted (admin) scope value (`SCOPE_UNRESTRICTED`). An actor is admin iff `scope == 0`. */
export const scopeUnrestricted = 0x00

/**
 * `AccountState.flags` bits (base/eip-8130 `AccountConfiguration`).
 *
 * The lock state is derived from these flags plus the `lockUnion` field: while
 * `unlockInitiated` is clear, `lockUnion` holds the configured unlock delay
 * (seconds); while set, it holds `unlocksAt` (the timestamp the unlock takes
 * effect). Only meaningful when `locked` is set.
 */
export const accountStateFlags = {
  /** `FLAG_REVOKE_DEFAULT_EOA` — disables the implicit k1 self key. */
  revokeDefaultEoa: 0x01,
  /** `FLAG_LOCKED` — actor configuration is frozen. */
  locked: 0x02,
  /** `FLAG_UNLOCK_INITIATED` — selects how `lockUnion` is interpreted. */
  unlockInitiated: 0x04,
} as const

/** `applySignedLockChanges` op selecting a hard lock (`LOCK_OP`). */
export const lockOp = 0x01

/** `applySignedLockChanges` op initiating a (delayed) unlock (`UNLOCK_OP`). */
export const unlockOp = 0x02

/** Exact `policyData` byte length for a policy-bearing actor: `manager (20) || commitment (32)` (`POLICY_DATA_LEN`). */
export const policyDataLength = 52

/**
 * Nonce-free mode selector (`NONCE_KEY_MAX`). When `nonceKey` equals this value,
 * no nonce state is read or incremented and replay protection relies on
 * `expiry`.
 */
export const nonceKeyMax = 2n ** 256n - 1n

/**
 * Protocol-reserved native secp256k1 (ECDSA) authenticator address
 * (`ECRECOVER_AUTHENTICATOR`).
 */
export const ecrecoverAuthenticator =
  '0x0000000000000000000000000000000000000001' satisfies Hex

/**
 * Revocation marker written to an implicit EOA actor slot
 * (`REVOKED_AUTHENTICATOR` = `type(uint160).max`).
 */
export const revokedAuthenticator =
  '0xffffffffffffffffffffffffffffffffffffffff' satisfies Hex

/**
 * Sentinel authenticator for execution-enabled "trusted executor" actors
 * (`TRUSTED_EXECUTOR = address(uint160(uint256(keccak256("trustedExecutor"))))`,
 * as defined in `base/eip-8130`'s `DefaultAccount`).
 *
 * No contract is deployed here. An actor whose `authenticator` is this sentinel
 * is authorized to drive the account via `executeBatch` when it is the
 * `msg.sender` (e.g. an ERC-4337 EntryPoint or a {@link policyManagerAbi}
 * PolicyManager). It cannot produce signatures — only direct calls. A
 * policy-gated session key therefore requires its `manager` to also be
 * registered as a trusted-executor actor (see {@link key.trustedExecutor}),
 * otherwise the manager's forwarded `executeBatch` reverts.
 */
export const trustedExecutorAuthenticator =
  '0xbe114b191a3ac7519670cac0c5e74aac1d819a13' satisfies Hex

/**
 * Canonical authenticator set (the signature algorithms compliant nodes MUST
 * accept). `k1` is the native `ECRECOVER_AUTHENTICATOR` sentinel; the others are
 * onchain contracts.
 *
 * @remarks
 * The non-native addresses below are the [base/eip-8130](https://github.com/base/eip-8130)
 * deployment (Base Sepolia). They may differ per chain — resolve via
 * {@link eip8130Deployments} / {@link getEip8130Deployment}, or override per call.
 */
export const canonicalAuthenticators = {
  /** secp256k1 — native sentinel (`ECRECOVER_AUTHENTICATOR` / `K1_AUTHENTICATOR`). */
  k1: '0x0000000000000000000000000000000000000001',
  /** P-256 (raw). Canonical base/eip-8130 deployment. */
  p256: '0xf8847a74F8067CabaE5fe56B70b372A7D670f0f8',
  /** WebAuthn / FIDO2 passkey. Canonical base/eip-8130 deployment. */
  passkey: '0x871c72d3950308A028E9c4917591bcfd3D6a1EF7',
  /** Signature delegation (1-hop). Canonical base/eip-8130 deployment. */
  delegate: '0xbb73E3871FBaC8aef1a7Ee8A24E21139916f14C2',
} as const satisfies Record<string, Hex>

/**
 * Representative authentication-payload byte length (the bytes after a
 * prefixed blob's 20-byte authenticator selector) for each canonical
 * authenticator, keyed by lowercased address. Used by `estimateGas8130` to
 * synthesize an auth-blob stub from a verifier-address hint alone, without
 * requiring the caller to know the exact real signature length.
 *
 * @remarks
 * These are representative defaults, not exact sizes — e.g. a real WebAuthn
 * payload's length varies with client-data JSON length. Mirrors the node's
 * `Eip8130AuthScheme::default_data_len`. Pass an explicit size to override.
 */
export const canonicalAuthDataLength: Record<string, number> = {
  [canonicalAuthenticators.k1.toLowerCase()]: 65,
  [canonicalAuthenticators.p256.toLowerCase()]: 128,
  [canonicalAuthenticators.passkey.toLowerCase()]: 256,
}

/** Nonce Manager precompile address (`NONCE_MANAGER_ADDRESS`). */
export const nonceManagerAddress =
  '0x813000000000000000000000000000000000aa01' satisfies Hex

/** Transaction Context precompile address (`TX_CONTEXT_ADDRESS`). */
export const txContextAddress =
  '0x813000000000000000000000000000000000aa02' satisfies Hex

/**
 * Account Configuration system contract address (`ACCOUNT_CONFIG_ADDRESS`),
 * used as the CREATE2 deployer for account address derivation.
 *
 * @remarks
 * Defaults to the [base/eip-8130](https://github.com/base/eip-8130) deployment
 * (Base Sepolia). The address may differ per chain — resolve via
 * {@link getEip8130Deployment}, or override via the `accountConfigAddress`
 * parameter of {@link computeAddress8130}.
 */
export const accountConfigAddress =
  '0x53648Cf00356fbAA1F2B531715c6B64AaBDE1555' satisfies Hex

/**
 * Default wallet implementation for EOA auto-delegation
 * (`DEFAULT_ACCOUNT_ADDRESS`).
 *
 * @remarks
 * Defaults to the base/eip-8130 deployment (Base Sepolia); see
 * {@link accountConfigAddress}.
 */
export const defaultAccountAddress =
  '0x58da469ef71Dd4B092B010CdA37DE124C926EebD' satisfies Hex

/** Size of the deployment header in bytes (`DEPLOYMENT_HEADER_SIZE`). */
export const deploymentHeaderSize = 14

/** Maximum placed runtime code size for a create entry (EIP-170). */
export const maxCodeSize = 24576
