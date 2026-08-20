import type { Address } from 'abitype'
import type * as Hex from 'ox/Hex'
import * as Json from 'ox/Json'
import {
  MultisigConfig,
  type KeyAuthorization as ox_KeyAuthorization,
  TxEnvelopeTempo,
} from 'ox/tempo'
import type { OneOf } from '../../types/utils.js'
import {
  InvalidStoreValueError,
  type Store,
  StoreConflictError,
} from './Store.js'

/** Bounds parsing and serialization work if a store returns malformed or unexpectedly large data. */
const maxStoredValueLength = 1_048_576

/** Prevents sustained compare-and-set contention from retrying an update indefinitely. */
const maxUpdateAttempts = 32

/** Identifies the persisted representation so future formats can be distinguished. */
const schemaVersion = 1

/** Fields shared by every persisted multisig operation. */
type Base = {
  /** Multisig account. */
  account: Address
  /** Collected serialized owner approvals. */
  approvals: readonly Hex.Hex[]
  /** Configuration used to verify the approvals. */
  config: MultisigConfig.Config
  /** Time when the operation was created. */
  createdAt: number
  /** Deterministic operation ID. */
  id: Hex.Hex
  /** Persisted operation schema version. */
  schemaVersion: typeof schemaVersion
  /** Number of owner approvals selected for quorum evaluation. */
  signatures: number
  /** Required owner weight. */
  threshold: number
  /** Time when the operation was last updated. */
  updatedAt: number
  /** Multisig configuration version. */
  version: bigint
  /** Selected owner weight. */
  weight: number
}

/** Unsigned key authorization stored while approvals are collected. */
type UnsignedKeyAuthorization =
  ox_KeyAuthorization.KeyAuthorization<false> extends infer authorization
    ? authorization extends ox_KeyAuthorization.KeyAuthorization<false>
      ? Omit<authorization, 'signature'>
      : never
    : never

/** Pending transaction state. */
export type TransactionPending = Base & {
  /** Whether the transaction initializes the multisig account. */
  init: boolean
  /** Operation is awaiting submission or a successful retry. */
  status: 'pending'
  /** Unsigned transaction used to build the final envelope. */
  transaction: Omit<TxEnvelopeTempo.TxEnvelopeTempo, 'signature'>
}

/** Successful transaction state. */
export type TransactionSuccess = Base & {
  /** Operation was submitted successfully. */
  status: 'success'
  /** Submitted transaction hash. */
  transactionHash: Hex.Hex
}

/** Pending key-authorization state. */
export type KeyAuthorizationPending = Base & {
  /** Unsigned key authorization awaiting its owner quorum. */
  keyAuthorization: UnsignedKeyAuthorization
  /** Operation is awaiting its owner quorum. */
  status: 'pending'
}

/** Successful key-authorization state. */
export type KeyAuthorizationSuccess = Base & {
  /** Signed key authorization produced by its owner quorum. */
  keyAuthorization: ox_KeyAuthorization.Signed
  /** Operation completed successfully. */
  status: 'success'
}

/** Persisted state for one transaction operation. */
export type Transaction = OneOf<TransactionPending | TransactionSuccess>

/** Persisted state for one key-authorization operation. */
export type KeyAuthorization = OneOf<
  KeyAuthorizationPending | KeyAuthorizationSuccess
>

/** Persisted state for one multisig operation. */
export type Operation = OneOf<
  | TransactionPending
  | TransactionSuccess
  | KeyAuthorizationPending
  | KeyAuthorizationSuccess
>

/**
 * Reads a persisted multisig operation.
 *
 * @param store - Multisig store.
 * @param id - Operation ID.
 * @returns The operation, or `null` when it is unknown.
 */
export async function read(
  store: Store,
  id: Hex.Hex,
): Promise<Operation | null> {
  const operation = await store.get(operationKey(id))
  if (operation === null) return null
  if (operation.id.toLowerCase() !== id.toLowerCase())
    throw new InvalidStoreValueError()
  return operation
}

/**
 * Atomically updates a multisig operation.
 *
 * @param store - Multisig store.
 * @param id - Operation ID.
 * @param update - Function that creates the next operation value.
 * @returns The persisted operation.
 */
export async function update(
  store: Store,
  id: Hex.Hex,
  update: (operation: Operation | null) => Operation | Promise<Operation>,
): Promise<Operation> {
  const key = operationKey(id)
  for (let attempt = 0; attempt < maxUpdateAttempts; attempt++) {
    const current = await store.get(key)
    if (current && current.id.toLowerCase() !== id.toLowerCase())
      throw new InvalidStoreValueError()
    const next = await update(current)
    if (next.id.toLowerCase() !== id.toLowerCase())
      throw new InvalidStoreValueError()
    if (await store.compareAndSet(key, current, next)) return next
  }
  throw new StoreConflictError()
}

/**
 * Creates a multisig operation.
 *
 * @param operation - Operation fields.
 * @returns The operation.
 */
export function from(operation: from.Value): Operation {
  return deserialize(Json.stringify({ ...operation, schemaVersion }))
}

export declare namespace from {
  /** Operation fields accepted by {@link from}. */
  export type Value = Operation extends infer operation
    ? operation extends Operation
      ? Omit<operation, 'schemaVersion'>
      : never
    : never
}

/**
 * Deserializes a multisig operation.
 *
 * @param value - Serialized operation from a string-backed store or RPC.
 * @returns The operation.
 */
export function deserialize(value: string): Operation {
  if (value.length > maxStoredValueLength) throw new InvalidStoreValueError()
  const operation = Json.parse(value) as Operation
  const config = MultisigConfig.from(operation.config)
  if (operation.keyAuthorization) return { ...operation, config }
  if (operation.status === 'pending')
    return {
      ...operation,
      config,
      transaction: TxEnvelopeTempo.from(operation.transaction),
    }
  return { ...operation, config }
}

/**
 * Serializes a multisig operation.
 *
 * @param operation - Operation to serialize.
 * @returns The serialized operation for a string-backed store or RPC.
 */
export function serialize(operation: Operation): string {
  const value = Json.stringify(operation)
  if (value.length > maxStoredValueLength) throw new InvalidStoreValueError()
  return value
}

/** Returns the storage key for an operation ID. */
function operationKey(id: Hex.Hex) {
  return `multisig:operation:${id.toLowerCase()}`
}
