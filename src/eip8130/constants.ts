import type { Hex } from '../types/misc.js'

/**
 * EIP-2718 transaction type for AA transactions (`AA_TX_TYPE`).
 */
export const aaTransactionType = '0x79' satisfies Hex

/**
 * Magic byte for payer signature domain separation (`AA_PAYER_TYPE`).
 */
export const aaPayerType = '0x7a' satisfies Hex

/** Base intrinsic gas cost (`AA_BASE_COST`). */
export const aaBaseCost = 15000n

/**
 * Fixed secp256k1 authentication cost (`K1_AUTH_COST`): ecrecover (3,000) plus
 * one cold account-state read (2,100). Charged per authenticated role.
 */
export const k1AuthCost = 5100n

/**
 * Intrinsic cost per value-bearing call (`TX_VALUE_COST`): charged for each
 * call with `value > 0` and `to != sender`.
 */
export const txValueCost = 6000n

/** Intrinsic cost of a delegation entry (`DELEGATION_COST`): 200 × 23 bytes. */
export const delegationCost = 4600n

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
 * `nonce_key_cost` for the protocol nonce (`nonce_key == 0`): the account
 * nonce, bumped without touching the nonce manager, so `aaBaseCost` covers it.
 */
export const protocolNonceCost = 0n

/**
 * Domain-separation prefix for the nonce-free `replay_id` preimage
 * (`REPLAY_ID_TYPE`): `keccak256(REPLAY_ID_TYPE || rlp([chain_id,
 * resolved_sender, valid_after, valid_before, account_changes, calls, metadata,
 * payer]))`.
 */
export const replayIdType = '0x7901' satisfies Hex

/**
 * Unit-detection boundary for `validAfter` / `validBefore`
 * (`TIMESTAMP_MS_THRESHOLD`). Values below it are interpreted as seconds and
 * values at or above it as milliseconds; `0` means no bound.
 */
export const timestampMsThreshold = 100_000_000_000n

/**
 * Consensus/execution replay window (**milliseconds**) for nonce-free
 * transactions (`NONCE_FREE_EXPIRY_WINDOW`). A nonce-free tx's `validBefore`
 * must fall within `(now, now + NONCE_FREE_EXPIRY_WINDOW]`, where `now` is
 * `block.timestamp * 1000`.
 */
export const nonceFreeExpiryWindow = 30000n

/**
 * Mempool-admission cap (**milliseconds**) on a nonce-free tx's `validBefore`
 * window (`NONCE_FREE_MAX_EXPIRY_WINDOW`); tighter than the consensus window.
 */
export const nonceFreeMaxExpiryWindow = 20000n

/**
 * Default window (**milliseconds**) for an auto-computed nonce-free
 * `validBefore`. The node measures the admission window from chain time, so the
 * default leaves slack under {@link nonceFreeMaxExpiryWindow} for client clock
 * skew and propagation delay.
 */
export const nonceFreeDefaultExpiryWindow = 15000n

/** Enshrined nonce-free replay ring-buffer capacity (`REPLAY_BUFFER_CAPACITY`). */
export const replayBufferCapacity = 300000n

/**
 * Account change entry type discriminators: the first element of each
 * `account_changes` entry's flat RLP list `rlp([type_byte, ...fields])`.
 *
 * The AA transaction type defines `delegation` (`0x01`). `create` (`0x02`) and
 * `config` (`0x03`) are assigned by the EIP-8130 Keystore integration; they are
 * encoded here so any `AA_TX_TYPE` transaction round-trips, and are built with
 * `viem/experimental/keystore`.
 */
export const accountChangeType = {
  delegation: '0x01',
  create: '0x02',
  config: '0x03',
} as const satisfies Record<string, Hex>

/**
 * `ChangeType` operations within a `SignedAccountChanges` batch (the Keystore
 * `config` account-change entry). Mirrors `Keystore.ChangeType`; the value is
 * the wire op byte hashed into the batch digest.
 *
 * - `authorizeActor` / `revokeActor`: authority ops (mutate who can act).
 * - `incrementLocalEpoch`: bump the local epoch (either channel; empty payload).
 * - `lock` / `unlock`: environment ops, Local-channel only and must be the
 *   batch's only op.
 */
export const changeType = {
  authorizeActor: 0x00,
  revokeActor: 0x01,
  incrementLocalEpoch: 0x02,
  lock: 0x03,
  unlock: 0x04,
} as const

/**
 * Nonce-free mode selector (`NONCE_KEY_MAX`). When `nonceKey` equals this value,
 * no nonce state is read or incremented and replay protection relies on
 * `validBefore`.
 */
export const nonceKeyMax = 2n ** 256n - 1n

/**
 * Native secp256k1 authenticator selector (`K1_AUTHENTICATOR`, `address(1)`).
 * A named sender or payer authenticates as `K1_AUTHENTICATOR || r || s || v`.
 */
export const k1Authenticator =
  '0x0000000000000000000000000000000000000001' satisfies Hex

/** Alias of {@link k1Authenticator} (`ECRECOVER_AUTHENTICATOR`). */
export const ecrecoverAuthenticator = k1Authenticator

/** Byte length of a secp256k1 authentication payload (`r || s || v`). */
export const k1AuthDataLength = 65

/**
 * Wire value of the `payer` field for **open** payer mode: the single byte
 * `0x00`. The sender does not name a payer; any key willing to pay signs the
 * payer hash, and the payer is recovered from a raw 65-byte `payer_auth`.
 */
export const openPayer = '0x00' satisfies Hex

/** Nonce Manager precompile address (`NONCE_MANAGER_ADDRESS`). */
export const nonceManagerAddress =
  '0x813000000000000000000000000000000000aa01' satisfies Hex
