import type { Hex } from '../../types/misc.js'

/**
 * JIT sentinel for the **local** channel's low 32 bits (`localSequence`):
 * `type(uint32).max`. When a `'local'` sequence word's low half equals this, the
 * signed change is *unsequenced* — bound to the current `localEpoch` (the high 32
 * bits) but not pinned to a monotonic `localSequence`, so it may land at any
 * position within the epoch and is invalidated by an `incrementLocalEpoch` bump.
 * Mirrors `Keystore.UNSEQUENCED`.
 *
 * Build the full `uint64` sequence word from the current epoch with
 * {@link unsequencedLocalSequence}.
 */
export const unsequencedLocalHalf = 0xffff_ffffn

/**
 * Actor scope permission bitmask values (base/eip-8130 `Scopes`, a `uint16`).
 *
 * Core grants occupy bits 0–2 (`OPERATOR`, `SELF_PAYER`, `SPONSOR_PAYER`); the
 * optional `POLICY` and `NONCE` grants trail them. Bits `0x20`..`0x8000` are
 * spare, reserved for future pure grants.
 *
 * `0x00` (unrestricted) is admin: an actor is admin iff `scope == 0`. There is
 * no `SCOPE_SIGNATURE` / `SCOPE_CONFIG` bit — ERC-1271 signing and config rights
 * ride on operational authority (`isOperator`: `scope == 0 || OPERATOR set`).
 * `OPERATOR` and `POLICY` do **not** combine: `OPERATOR` may originate to any
 * `call.to` and overrides `POLICY`, whereas a `POLICY`-only actor is gated to its
 * manager. A policy-gated session key must therefore be `POLICY`-only.
 */
export const actorScope = {
  /** `OPERATOR` — ungated initiation: may originate transactions to any `call.to`. Formerly `SCOPE_SENDER`. */
  operator: 0x01,
  /** `SELF_PAYER` — may pay for its own transactions (`payer == sender`). */
  selfPayer: 0x02,
  /** `SPONSOR_PAYER` — may sponsor others (`payer != sender`). */
  sponsorPayer: 0x04,
  /** `POLICY` — gated initiation: actor is gated to its policy manager. Attachment is by payload length; this bit gates `sender_auth`. */
  policy: 0x08,
  /** `NONCE` — may use sequenced nonce keys; without it, restricted to nonce-free (`NONCE_KEY_MAX`). */
  nonce: 0x10,
} as const

/** Unrestricted (admin) scope value (`SCOPE_UNRESTRICTED`). An actor is admin iff `scope == 0`. */
export const scopeUnrestricted = 0x00

/**
 * `AccountState.flags` bits (base/eip-8130 `Keystore`).
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

/** Exact `policyData` byte length for a policy-bearing actor: `manager (20) || commitment (32)` (`POLICY_DATA_LEN`). */
export const policyDataLength = 52

/**
 * Revocation marker written to an implicit EOA actor slot
 * (`REVOKED_AUTHENTICATOR` = `type(uint160).max`).
 */
export const revokedAuthenticator =
  '0xffffffffffffffffffffffffffffffffffffffff' satisfies Hex

/**
 * Sentinel authenticator for external-pull policy actors
 * (`EXTERNAL_POLICY_AUTHENTICATOR = address(uint160(uint256(keccak256("externalPolicyCaller"))))`,
 * as defined in `base/eip-8130`'s `PolicyManager`).
 *
 * No contract is deployed here. An actor whose `authenticator` is this sentinel
 * represents an *external caller* governed by a policy (e.g. a subscription
 * provider): it may act ONLY through the manager's external entrypoints
 * (`executeFor` / `executeForMany`), never directly. Because the address is
 * no-code, the actor cannot authenticate an EIP-8130 transaction or drive
 * `executeBatch` — the manager requires `authenticator == this` on the external
 * path, and the acting `actorId` is `actorIdFromAddress(msg.sender)` (the pull
 * caller's own address). See {@link key.externalPull}.
 */
export const externalPolicyAuthenticator =
  '0x8a22e6B3c724A7D0C3aCA1f7EbD089CfbD96B392' satisfies Hex

/**
 * Canonical authenticator set (the signature algorithms compliant nodes MUST
 * accept). `k1` is the native `K1_AUTHENTICATOR` sentinel; the others are
 * onchain contracts.
 *
 * @remarks
 * The non-native addresses below are the [base/eip-8130](https://github.com/base/eip-8130)
 * deployment. Each is deployed through Nick's deterministic CREATE2 factory with
 * a mined salt, so the address is a pure function of its bytecode and is
 * identical on every supported chain. Pass a different authenticator per account
 * via the `authenticator` parameter when using a custom verifier.
 */
export const canonicalAuthenticators = {
  /** secp256k1 — native sentinel (`K1_AUTHENTICATOR`). */
  k1: '0x0000000000000000000000000000000000000001',
  /** P-256 (raw). Canonical base/eip-8130 deployment. */
  p256: '0x8130C89F65750431b564A4730397552a11CeA256',
  /** WebAuthn / FIDO2 passkey. Canonical base/eip-8130 deployment. */
  passkey: '0x813007b6b1b48E75D91dEc5927ab515d12a0F1d0',
  /** Signature delegation (1-hop). Canonical base/eip-8130 deployment. */
  delegate: '0x81301AA52202f8C6b79Cde660440E3c6A7c5ade1',
} as const satisfies Record<string, Hex>

/**
 * Representative authentication-payload byte length (the bytes after a
 * prefixed blob's 20-byte authenticator selector) for each canonical
 * authenticator, keyed by lowercased address. Pass as `senderAuthSize` /
 * `payerAuthSize` to `estimateGas` when pricing a non-k1 actor.
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

/** Transaction Context precompile address (`TX_CONTEXT_ADDRESS`). */
export const txContextAddress =
  '0x813000000000000000000000000000000000aa02' satisfies Hex

/**
 * The EIP-8130 Keystore system contract address, also used as the CREATE2
 * deployer for account address derivation.
 *
 * @remarks
 * There is a single keystore: it is **enshrined** in the execution client and is
 * identical on every supported chain. It is deployed via
 * [base/eip-8130](https://github.com/base/eip-8130) through Nick's deterministic
 * CREATE2 factory with a mined salt. This value is not configurable — using any
 * other address derives a different account address and the create transaction
 * fails.
 */
export const keystoreAddress =
  '0x813012Bd8D971928475235BBac6F0488c4A100AC' satisfies Hex

/**
 * Canonical Keystore-aware wallet implementation (`DefaultAccount`). Usable as
 * the target of an explicit `delegation` account change; nothing is delegated
 * automatically.
 *
 * @remarks
 * Deployed through the deterministic CREATE2 factory, so this address is
 * identical on every supported chain; see {@link keystoreAddress}.
 */
export const defaultAccountAddress =
  '0x81309c54D6Bc190FbBc0FA9f296ea4C6A539ADEf' satisfies Hex

/** Size of the deployment header in bytes (`DEPLOYMENT_HEADER_SIZE`). */
export const deploymentHeaderSize = 14

/** Maximum placed runtime code size for a create entry (EIP-170). */
export const maxCodeSize = 24576
