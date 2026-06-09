import type { Address } from 'abitype'
import type { Hex } from '../../../types/misc.js'

/**
 * A single call within a phase. Calls carry no ETH value (per EIP-8130); value
 * transfers are initiated by the account's wallet bytecode.
 */
export type AaCall = {
  /** Target address. */
  to: Address
  /** Calldata. @default '0x' */
  data?: Hex | undefined
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
 * An initial actor for a `create` entry. Initial actors are always registered as
 * unrestricted owners (`scope = 0x00`, no policy, no expiry); only `actorId` and
 * `authenticator` participate in address derivation.
 */
export type AaActor = {
  /** 32-byte actor identifier. */
  actorId: Hex
  /** Authenticator contract address. */
  authenticator: Address
}

/** `create` (type `0x00`) account-change entry: deploy a new account. */
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

/** `authorizeActor` (change type `0x01`) operation within a config-change entry. */
export type AaAuthorizeActor = {
  changeType: 0x01
  /** 32-byte actor identifier. */
  actorId: Hex
  /** Authenticator contract address. */
  authenticator: Address
  /** Permission bitmask. `0` (or omitted) = unrestricted. */
  scope?: number | undefined
  /** Actor expiry (unix seconds). `0` (or omitted) = no expiry. */
  expiry?: bigint | undefined
  /** Policy type. `0` (or omitted) = no policy. */
  policyType?: number | undefined
  /** Policy data (`manager || commitment` when `policyType != 0`). */
  policyData?: Hex | undefined
}

/** `revokeActor` (change type `0x02`) operation within a config-change entry. */
export type AaRevokeActor = {
  changeType: 0x02
  /** 32-byte actor identifier. */
  actorId: Hex
}

export type AaActorChange = AaAuthorizeActor | AaRevokeActor

/** `config` (type `0x01`) account-change entry: actor management. */
export type AaAccountChangeConfig = {
  type: 'config'
  /** Chain ID scope. `0` = valid on any chain (multichain channel). */
  chainId: number
  /** Monotonic ordering sequence within the channel. */
  sequence: number
  /** Actor change operations. */
  actorChanges: readonly AaActorChange[]
  /** Authorization signature (`authenticator || data`). */
  auth: Hex
}

/** `delegation` (type `0x02`) account-change entry: code delegation. */
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
 * An EIP-8130 (`AA_TX_TYPE`) serializable transaction.
 *
 * The wire format is:
 *
 * ```
 * AA_TX_TYPE || rlp([
 *   chain_id, sender, nonce_key, nonce_sequence, expiry,
 *   max_priority_fee_per_gas, max_fee_per_gas, gas_limit,
 *   account_changes, calls, payer, sender_auth, payer_auth
 * ])
 * ```
 */
export type TransactionSerializable8130 = {
  /** Chain ID per EIP-155. */
  chainId: number
  /**
   * Sending account address (the wire `sender` field). Omit (EOA path) to have
   * the address recovered from `senderAuth` via ecrecover; set it for configured
   * actor signatures.
   */
  from?: Address | undefined
  /** Nonce channel selector (`uint256`). `0` = standard sequential ordering. */
  nonceKey?: bigint | undefined
  /** Expected sequence number within `nonceKey` (`uint64`). */
  nonceSequence?: bigint | undefined
  /** Unix timestamp (seconds) after which the transaction is invalid. `0` = no expiry. */
  expiry?: bigint | undefined
  /** Max priority fee per gas (EIP-1559). */
  maxPriorityFeePerGas?: bigint | undefined
  /** Max fee per gas (EIP-1559). */
  maxFeePerGas?: bigint | undefined
  /** Gas budget for sender-intrinsic gas and call execution (`gas_limit`). */
  gas?: bigint | undefined
  /** Account creation, config change, and/or delegation operations. */
  accountChanges?: readonly AaAccountChange[] | undefined
  /** Ordered call phases. */
  calls?: AaCalls | undefined
  /** Gas payer. Omit for self-pay; set to a 20-byte address for sponsored. */
  payer?: Address | undefined
  /**
   * Sender authorization. EOA path: raw 65-byte ECDSA signature. Configured
   * actor: `authenticator (20 bytes) || data`.
   */
  senderAuth?: Hex | undefined
  /**
   * Payer authorization. Omit for self-pay; otherwise `authenticator || data`
   * (same format as `senderAuth`).
   */
  payerAuth?: Hex | undefined
}

/** A serialized EIP-8130 transaction (hex envelope). */
export type TransactionSerialized8130 = Hex
