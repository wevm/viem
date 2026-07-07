import type { Hex } from '../../types/misc.js'

/**
 * EIP-2718 transaction type for EIP-8130 AA transactions (`AA_TX_TYPE`).
 */
export const aaTransactionType = '0x7b' satisfies Hex

/**
 * Magic byte for payer signature domain separation (`AA_PAYER_TYPE`).
 */
export const aaPayerType = '0x7c' satisfies Hex

/** Base intrinsic gas cost (`AA_BASE_COST`). */
export const aaBaseCost = 15000n

/**
 * Account change entry type discriminators (first element of each
 * `account_changes` entry).
 */
export const accountChangeType = {
  create: '0x00',
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
 * Actor scope permission bitmask values.
 *
 * `0x00` (unrestricted) is represented by the absence of any bit.
 */
export const actorScope = {
  signature: 0x01,
  sender: 0x02,
  payer: 0x04,
  config: 0x08,
} as const

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
 * Sentinel authenticator for execution-enabled "external caller" actors
 * (`EXTERNAL_CALLER_AUTHENTICATOR = address(uint160(uint256(keccak256("externalCaller"))))`).
 *
 * No contract is deployed here. An actor whose `authenticator` is this sentinel
 * is authorized to drive the account via `executeBatch` when it is the
 * `msg.sender` (e.g. an ERC-4337 EntryPoint or a {@link policyManagerAbi}
 * PolicyManager). It cannot produce signatures — only direct calls.
 */
export const externalCallerAuthenticator =
  '0x345249274eE98994AbBf79ef955319e4Cb3f6849' satisfies Hex

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
  /** secp256k1 — native sentinel (`ECRECOVER_AUTHENTICATOR`). */
  k1: '0x0000000000000000000000000000000000000001',
  /** P-256 (raw). base/eip-8130 deployment (Base Sepolia). */
  p256: '0x3AE129D846CD1CAf0369b4Caa56c188E18E11B15',
  /** WebAuthn / FIDO2 passkey. base/eip-8130 deployment (Base Sepolia). */
  passkey: '0x1CB75BE39Fb950202BF4239010534B86EdA66c31',
  /** Signature delegation (1-hop). base/eip-8130 deployment (Base Sepolia). */
  delegate: '0x4C4D27e56087797Feca62262417d57be4e30dD1F',
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
  '0xAff8A7A86605D61197C1b98630d93B9d9702afb5' satisfies Hex

/**
 * Default wallet implementation for EOA auto-delegation
 * (`DEFAULT_ACCOUNT_ADDRESS`).
 *
 * @remarks
 * Defaults to the base/eip-8130 deployment (Base Sepolia); see
 * {@link accountConfigAddress}.
 */
export const defaultAccountAddress =
  '0xD67D6ae50521A0ea9Aa1e174C536F346E87a1903' satisfies Hex

/** Size of the deployment header in bytes (`DEPLOYMENT_HEADER_SIZE`). */
export const deploymentHeaderSize = 14

/** Maximum placed runtime code size for a create entry (EIP-170). */
export const maxCodeSize = 24576
