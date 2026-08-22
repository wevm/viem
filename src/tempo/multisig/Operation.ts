import type { Address } from 'abitype'
import type * as Hex from 'ox/Hex'
import * as Json from 'ox/Json'
import {
  MultisigConfig,
  type KeyAuthorization as ox_KeyAuthorization,
  TxEnvelopeTempo,
} from 'ox/tempo'
import { BaseError } from '../../errors/base.js'
import type { OneOf } from '../../types/utils.js'
import type * as Storage from '../Storage.js'

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
  /** Deterministic operation hash. */
  hash: Hex.Hex
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

/** Transaction state while one coordinator owns the submission lease. */
export type TransactionSubmitting = Base & {
  /** Whether the transaction initializes the multisig account. */
  init: boolean
  /** Identifies the coordinator that owns the submission lease. */
  submissionId: Hex.Hex
  /** Time when another coordinator may reclaim the submission lease. */
  submissionExpiresAt: number
  /** Operation is being submitted by one coordinator. */
  status: 'submitting'
  /** Unsigned transaction used to build the final envelope. */
  transaction: Omit<TxEnvelopeTempo.TxEnvelopeTempo, 'signature'>
  /** Deterministic hash of the final signed transaction. */
  transactionHash: Hex.Hex
}

/** Successful transaction state. */
export type TransactionSuccess = Base & {
  /** Whether the transaction initializes the multisig account. */
  init: boolean
  /** Operation was submitted successfully. */
  status: 'success'
  /** Unsigned transaction used to build the final envelope. */
  transaction: Omit<TxEnvelopeTempo.TxEnvelopeTempo, 'signature'>
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
export type Transaction = OneOf<
  TransactionPending | TransactionSubmitting | TransactionSuccess
>

/** Persisted state for one key-authorization operation. */
export type KeyAuthorization = OneOf<
  KeyAuthorizationPending | KeyAuthorizationSuccess
>

/** Persisted state for one multisig operation. */
export type Operation = OneOf<
  | TransactionPending
  | TransactionSubmitting
  | TransactionSuccess
  | KeyAuthorizationPending
  | KeyAuthorizationSuccess
>

/**
 * Reads a persisted multisig operation.
 *
 * @param store - Multisig store.
 * @param hash - Operation hash.
 * @returns The operation, or `null` when it is unknown.
 */
export async function read(
  store: Storage.Storage,
  hash: Hex.Hex,
): Promise<Operation | null> {
  const value = await store.getItem(operationKey(hash))
  if (value === null || value === undefined) return null
  const operation = deserialize(value)
  if (operation.hash.toLowerCase() !== hash.toLowerCase())
    throw new InvalidStoreValueError()
  return operation
}

/**
 * Updates a multisig operation, atomically when the store supports it.
 *
 * @param store - Multisig store.
 * @param hash - Operation hash.
 * @param update - Function that creates the next operation value.
 * @returns The persisted operation.
 */
export async function update(
  store: Storage.Storage,
  hash: Hex.Hex,
  update: (operation: Operation | null) => Operation | Promise<Operation>,
): Promise<Operation> {
  const key = operationKey(hash)
  for (let attempt = 0; attempt < maxUpdateAttempts; attempt++) {
    const value = (await store.getItem(key)) ?? null
    const current = value === null ? null : deserialize(value)
    if (current && current.hash.toLowerCase() !== hash.toLowerCase())
      throw new InvalidStoreValueError()
    const next = await update(current)
    if (next.hash.toLowerCase() !== hash.toLowerCase())
      throw new InvalidStoreValueError()
    const serialized = serialize(next)
    if (!store.compareAndSet) {
      await store.setItem(key, serialized)
      return next
    }
    if (await store.compareAndSet(key, value, serialized)) return next
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
  if (operation.schemaVersion !== schemaVersion)
    throw new InvalidStoreValueError()
  const config = MultisigConfig.from(operation.config)
  if (operation.keyAuthorization) return { ...operation, config }
  const transaction = operation as Transaction
  return {
    ...transaction,
    config,
    transaction: TxEnvelopeTempo.from(transaction.transaction),
  } as Operation
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

/** Returns the store key for an operation hash. */
function operationKey(hash: Hex.Hex) {
  return `multisig:operation:${hash.toLowerCase()}`
}

/** Type returned by {@link InvalidStoreValueError}. */
export type InvalidStoreValueErrorType = InvalidStoreValueError & {
  /** Error name. */
  name: 'Multisig.Operation.InvalidStoreValueError'
}

/** Thrown when a stored multisig operation is malformed or unsupported. */
export class InvalidStoreValueError extends BaseError {
  /** Creates an invalid store value error. */
  constructor(options: InvalidStoreValueError.Options = {}) {
    super('Stored multisig operation is malformed or unsupported.', {
      cause: options.cause as Error | undefined,
      name: 'Multisig.Operation.InvalidStoreValueError',
    })
  }
}

export declare namespace InvalidStoreValueError {
  /** Error construction options. */
  export type Options = {
    /** Underlying error. */
    cause?: unknown | undefined
  }
}

/** Thrown when a multisig operation cannot be updated due to contention. */
export class StoreConflictError extends BaseError {
  /** Creates a store conflict error. */
  constructor() {
    super('Multisig operation could not be updated after repeated conflicts.', {
      name: 'Multisig.Operation.StoreConflictError',
    })
  }
}
