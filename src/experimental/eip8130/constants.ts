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

/** Nonce Manager precompile address (`NONCE_MANAGER_ADDRESS`). */
export const nonceManagerAddress =
  '0x813000000000000000000000000000000000aa01' satisfies Hex

/** Transaction Context precompile address (`TX_CONTEXT_ADDRESS`). */
export const txContextAddress =
  '0x813000000000000000000000000000000000aa02' satisfies Hex
