import type { Address } from 'abitype'
import type { Hex } from '../../types/misc.js'

/**
 * A single call within a phase, encoded on the wire as `rlp([to, value, data])`.
 *
 * The protocol dispatches the call from `sender` with `msg.value = value`. The
 * transfer is part of the call frame and reverts with its phase; if `sender`
 * cannot cover `value` when the call runs, the phase reverts.
 */
export type AaCall = {
  /** Target address. */
  to: Address
  /** Calldata. @default '0x' */
  data?: Hex | undefined
  /** Wei transferred from `sender` to `to` with the call. @default 0n */
  value?: bigint | undefined
}

/**
 * Calls are grouped into ordered phases. Each phase is an atomic batch: if any
 * call in a phase reverts, that phase's state changes are discarded and
 * remaining phases are skipped. Completed phases persist.
 *
 * @example
 * ```ts
 * // Simple call: one phase, one call
 * const calls: AaCalls = [[{ to, data }]]
 * // Sponsor (phase 0) + user actions (phase 1)
 * const calls: AaCalls = [[sponsorPayment], [userActionA, userActionB]]
 * ```
 */
export type AaCalls = readonly (readonly AaCall[])[]

/**
 * An initial actor for a `create` entry, and the identity returned by the
 * {@link key} builders.
 *
 * Initial actors carry their `scope` (a `uint16` bitmask) and (when
 * `scope & SCOPE_POLICY`) their `policyData`; `expiry` is always `0` at creation.
 * The address-derivation commitment hashes each actor into a leaf
 * `keccak256(actorId(32) || authenticator(20) || scope(2, big-endian) || policyData)`
 * then hashes the concatenated leaves (`policyData` is empty unless the
 * `SCOPE_POLICY` bit is set, then exactly 52 bytes).
 */
export type AaActor = {
  /** 32-byte actor identifier. */
  actorId: Hex
  /** Authenticator contract address. */
  authenticator: Address
  /** Scope bitmask (`uint16`) committed at creation. `0` (or omitted) = unrestricted admin. */
  scope?: number | undefined
  /** Policy data (`manager || commitment`) — required iff `scope & SCOPE_POLICY`, else empty/omitted. */
  policyData?: Hex | undefined
}

/**
 * `create` (type `0x02`) account-change entry: deploy a new Keystore account.
 * Defined by the EIP-8130 Keystore integration (`viem/experimental/keystore`).
 */
export type AaAccountChangeCreate = {
  type: 'create'
  /** User-chosen uniqueness factor (bytes32). */
  userSalt: Hex
  /** Runtime bytecode placed at the account address. */
  code: Hex
  /**
   * Initial actors registered at creation. MUST be sorted by `actorId` in
   * strictly ascending order (required for deterministic address derivation).
   */
  initialActors: readonly AaActor[]
}

/**
 * `authorizeActor` (`ChangeType` `0x00`) op within a `SignedAccountChanges`
 * batch. Payload: `abi.encode(bytes32 actorId, (address authenticator, uint48
 * expiry, uint16 scope) config, bytes policyData)`.
 */
export type AaAuthorizeActor = {
  changeType: 0x00
  /** 32-byte actor identifier. */
  actorId: Hex
  /** Authenticator contract address. */
  authenticator: Address
  /** Permission bitmask (`uint16`). `0` (or omitted) = unrestricted admin. Set the `SCOPE_POLICY` bit for a policy-gated actor. */
  scope?: number | undefined
  /** Actor expiry (unix seconds, `uint48`). `0` (or omitted) = no expiry. */
  expiry?: bigint | undefined
  /** Policy data (`manager || commitment`) — required iff `scope & SCOPE_POLICY`, else empty/omitted. */
  policyData?: Hex | undefined
}

/** `revokeActor` (`ChangeType` `0x01`) op. Payload: `abi.encode(bytes32 actorId)`. */
export type AaRevokeActor = {
  changeType: 0x01
  /** 32-byte actor identifier. */
  actorId: Hex
}

/**
 * `incrementLocalEpoch` (`ChangeType` `0x02`) op: bumps the account's local
 * epoch, invalidating every unlanded local-channel signature at a prior epoch.
 * Valid on either channel; empty payload.
 */
export type AaIncrementLocalEpoch = {
  changeType: 0x02
}

/**
 * `lock` (`ChangeType` `0x03`) op: hard-locks the account with a delayed unlock.
 * Local channel only and MUST be the batch's only op. Payload:
 * `abi.encode(uint16 unlockDelay)`.
 *
 * @remarks The enshrined node currently defers lock/unlock (a batch carrying one
 * is rejected on the native path); it is contract-accurate but not yet accepted.
 */
export type AaLock = {
  changeType: 0x03
  /** Unlock delay in seconds (`uint16`, `1 … 65535`). */
  unlockDelay: number
}

/**
 * `unlock` (`ChangeType` `0x04`) op: initiates the delayed unlock. Local channel
 * only and MUST be the batch's only op; empty payload. See {@link AaLock}.
 */
export type AaUnlock = {
  changeType: 0x04
}

/** A single operation within a `SignedAccountChanges` batch. */
export type AaChange =
  | AaAuthorizeActor
  | AaRevokeActor
  | AaIncrementLocalEpoch
  | AaLock
  | AaUnlock

/** The replay domain a `SignedAccountChanges` batch binds to. */
export type AaChangeChannel = 'local' | 'multichain'

/**
 * `config` (type `0x03`) account-change entry: a signed `SignedAccountChanges`
 * batch (`applySignedAccountChanges`). Defined by the EIP-8130 Keystore
 * integration (`viem/experimental/keystore`).
 */
export type AaAccountChangeConfig = {
  type: 'config'
  /**
   * Replay channel. `'local'` binds `block.chainid` and carries the epoch +
   * sequence machinery; `'multichain'` binds chain id `0` (a plain monotonic
   * counter).
   */
  channel: AaChangeChannel
  /**
   * Channel sequence word (`uint64`). On the `'local'` channel this is
   * `localEpoch (high 32) || localSequence (low 32)`; on `'multichain'` it is a
   * plain monotonic counter. Source it from `getConfigSequence`.
   */
  sequence: bigint
  /** The ordered ops, applied all-or-nothing. */
  changes: readonly AaChange[]
  /** Authorization signature over the batch digest (`authenticator || data`). */
  signature: Hex
}

/**
 * `delegation` (type `0x01`) account-change entry: EIP-7702-style code
 * delegation for the sender, authorized by `sender_auth`. Requires the sender
 * to authenticate as its own secp256k1 key. At most one per transaction.
 */
export type AaAccountChangeDelegation = {
  type: 'delegation'
  /** Delegate target, or the zero address to clear delegation. */
  target: Address
}

export type AaAccountChange =
  | AaAccountChangeCreate
  | AaAccountChangeConfig
  | AaAccountChangeDelegation

/**
 * The `payer` wire field: an address for a named (bound) payer, or
 * {@link openPayer} (`0x00`) for open mode, where the payer is recovered from
 * `payer_auth`.
 */
export type AaPayer = Address | '0x00'

/**
 * An AA (`AA_TX_TYPE`) serializable transaction.
 *
 * The wire format is:
 *
 * ```
 * AA_TX_TYPE || rlp([
 *   chain_id, sender, nonce_key, nonce_sequence, valid_after, valid_before,
 *   max_priority_fee_per_gas, max_fee_per_gas, gas_limit,
 *   account_changes, calls, metadata, payer, sender_auth, payer_auth
 * ])
 * ```
 */
export type TransactionSerializable8130 = {
  /** Chain ID per EIP-155. */
  chainId: number
  /**
   * Sending account address (the wire `sender` field). Omit to have the sender
   * recovered from a raw 65-byte `senderAuth`; set it to name the sender, in
   * which case `senderAuth` is `authenticator || data`.
   */
  from?: Address | undefined
  /** Nonce channel selector (`uint256`). `0` = standard sequential ordering. */
  nonceKey?: bigint | undefined
  /** Expected sequence number within `nonceKey` (`uint64`). */
  nonceSequence?: bigint | undefined
  /**
   * Unix timestamp (`uint64`) before which the transaction is invalid, in
   * milliseconds or seconds (values below {@link timestampMsThreshold} are
   * read as seconds). `0` (or omitted) = no lower bound.
   */
  validAfter?: bigint | undefined
  /**
   * Unix timestamp (`uint64`) after which the transaction is invalid, in
   * milliseconds or seconds (values below {@link timestampMsThreshold} are
   * read as seconds). `0` (or omitted) = no expiry, but MUST be non-zero in
   * nonce-free mode (`nonceKey == nonceKeyMax`).
   */
  validBefore?: bigint | undefined
  /** Max priority fee per gas (EIP-1559). */
  maxPriorityFeePerGas?: bigint | undefined
  /** Max fee per gas (EIP-1559). */
  maxFeePerGas?: bigint | undefined
  /** Gas budget for sender-intrinsic gas and call execution (`gas_limit`). */
  gas?: bigint | undefined
  /** Typed account-change entries (delegation; Keystore create / config). */
  accountChanges?: readonly AaAccountChange[] | undefined
  /** Ordered call phases. */
  calls?: AaCalls | undefined
  /**
   * Opaque, application-defined metadata (arbitrary bytes) carried at the top
   * level of the transaction. Appended after `calls` in the signed body, so it
   * is authenticated by both the sender and (when present) the payer. Omit or
   * `'0x'` for none.
   *
   * High-level helpers (`prepareTransactionRequest` / `sendTransaction`) populate
   * this from `dataSuffix` / `client.dataSuffix` (the AA transaction has no
   * calldata suffix; attribution lands here instead).
   */
  metadata?: Hex | undefined
  /**
   * Gas payer. Omit for self-pay, set to an address for a named (bound) payer,
   * or {@link openPayer} (`0x00`) for open mode.
   */
  payer?: AaPayer | undefined
  /**
   * Sender authorization. Recovered sender (`from` omitted): raw 65-byte ECDSA
   * signature. Named sender: `authenticator (20 bytes) || data`.
   */
  senderAuth?: Hex | undefined
  /**
   * Payer authorization. Omit for self-pay. Open payer: raw 65-byte ECDSA
   * signature. Named payer: `authenticator (20 bytes) || data`.
   */
  payerAuth?: Hex | undefined
}

/** A serialized AA transaction (hex envelope). */
export type TransactionSerialized8130 = Hex
