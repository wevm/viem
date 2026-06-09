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
 * Canonical authenticator set (the signature algorithms compliant nodes MUST
 * accept). `k1` is the native `ECRECOVER_AUTHENTICATOR` sentinel; the others are
 * onchain contracts.
 *
 * @remarks
 * The non-native addresses are **placeholders**. The canonical set and its
 * CREATE2-derived addresses are maintained in a companion ERC and resolved per
 * deployment ([base/eip-8130](https://github.com/base/eip-8130)). Override as
 * needed until the canonical values are finalized.
 */
export const canonicalAuthenticators = {
  /** secp256k1 — native sentinel (`ECRECOVER_AUTHENTICATOR`). */
  k1: '0x0000000000000000000000000000000000000001',
  /** P-256 (raw). Placeholder address. */
  p256: '0x8130000000000000000000000000000000000256',
  /** WebAuthn / FIDO2 passkey. Placeholder address. */
  passkey: '0x8130000000000000000000000000000000007e6b',
  /** Signature delegation (1-hop). Placeholder address. */
  delegate: '0x81300000000000000000000000000000000de1e6',
} as const satisfies Record<string, Hex>

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
 * **Placeholder.** This address is CREATE2-derived at deployment in the
 * reference implementation ([base/eip-8130](https://github.com/base/eip-8130))
 * and resolved per-network. Override via the `accountConfigAddress` parameter of
 * {@link computeAddress8130} until the canonical value is finalized.
 */
export const accountConfigAddress =
  '0x8130000000000000000000000000000000008130' satisfies Hex

/**
 * Default wallet implementation for EOA auto-delegation
 * (`DEFAULT_ACCOUNT_ADDRESS`).
 *
 * @remarks
 * **Placeholder.** CREATE2-derived at deployment; see
 * {@link accountConfigAddress}.
 */
export const defaultAccountAddress =
  '0x8130000000000000000000000000000000000acc' satisfies Hex

/** Size of the deployment header in bytes (`DEPLOYMENT_HEADER_SIZE`). */
export const deploymentHeaderSize = 14

/** Maximum placed runtime code size for a create entry (EIP-170). */
export const maxCodeSize = 24576
