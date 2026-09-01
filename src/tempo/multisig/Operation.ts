import type * as Hex from 'ox/Hex'
import * as Json from 'ox/Json'
import { MultisigOperation, SignatureEnvelope, TxEnvelopeTempo } from 'ox/tempo'
import { BaseError } from '../../errors/base.js'
import type * as Store from '../Store.js'

/** Bounds parsing and serialization work if a store returns unexpectedly large data. */
const maxStoredValueLength = 1_048_576

/** Prevents sustained compare-and-set contention from retrying indefinitely. */
const maxUpdateAttempts = 32

/** Bounds abandoned operation state while allowing long-lived approval ceremonies. */
const pendingOperationTtl = 30 * 24 * 60 * 60 * 1_000

/** Reads a persisted multisig operation. */
export async function read(
  store: Store.Store,
  hash: Hex.Hex,
): Promise<MultisigOperation.Operation | null> {
  const value = await store.getItem(operationKey(hash))
  if (value === null || value === undefined) return null
  const operation = deserialize(value)
  if (operation.hash.toLowerCase() !== hash.toLowerCase())
    throw new InvalidStoreValueError()
  return operation
}

/** Atomically updates a multisig operation. */
export async function update(
  store: Store.Atomic,
  hash: Hex.Hex,
  update: (
    operation: MultisigOperation.Operation | null,
  ) => MultisigOperation.Operation | Promise<MultisigOperation.Operation>,
): Promise<MultisigOperation.Operation> {
  const key = operationKey(hash)
  for (let attempt = 0; attempt < maxUpdateAttempts; attempt++) {
    const value = (await store.getItem(key)) ?? null
    const current = value === null ? null : deserialize(value)
    if (current && current.hash.toLowerCase() !== hash.toLowerCase())
      throw new InvalidStoreValueError()
    const value_ = await update(current)
    let next: MultisigOperation.Operation
    try {
      next = MultisigOperation.from(value_)
    } catch (cause) {
      throw new InvalidStoreValueError({ cause })
    }
    if (next.hash.toLowerCase() !== hash.toLowerCase())
      throw new InvalidStoreValueError()
    const serialized = serialize(next)
    const options =
      next.status === 'success'
        ? undefined
        : { expiresAt: Date.now() + pendingOperationTtl }
    if (await store.compareAndSet(key, value, serialized, options)) return next
  }
  throw new StoreConflictError()
}

/** Reads a submission hash without rebuilding its envelope from mutable configurations. */
export async function readSubmission(
  store: Store.Store,
  operation: MultisigOperation.TransactionOperation,
  submissionId: Hex.Hex,
): Promise<Hex.Hex | null> {
  const value = await store.getItem(submissionKey(operation.hash, submissionId))
  if (value === null || value === undefined) return null
  try {
    if (value.length > maxStoredValueLength) throw new InvalidStoreValueError()
    const transaction = TxEnvelopeTempo.deserialize(
      value as TxEnvelopeTempo.Serialized,
    )
    if (transaction.signature?.type !== 'multisig')
      throw new InvalidStoreValueError()
    const serialized = MultisigOperation.serializeTransaction(operation, {
      approvals: transaction.signature.signatures.map((signature) =>
        SignatureEnvelope.serialize(signature),
      ),
    })
    if (serialized.toLowerCase() !== value.toLowerCase())
      throw new InvalidStoreValueError()
    return TxEnvelopeTempo.hash(transaction as TxEnvelopeTempo.Signed)
  } catch (cause) {
    if (cause instanceof InvalidStoreValueError) throw cause
    throw new InvalidStoreValueError({ cause })
  }
}

/** Removes a persisted final envelope after its submission is settled. */
export async function removeSubmission(
  store: Store.Store,
  hash: Hex.Hex,
  submissionId: Hex.Hex,
): Promise<void> {
  await store.removeItem(submissionKey(hash, submissionId))
}

/** Persists the final envelope before broadcast so recovery uses the exact transaction. */
export async function writeSubmission(
  store: Store.Atomic,
  hash: Hex.Hex,
  submissionId: Hex.Hex,
  transaction: TxEnvelopeTempo.Serialized,
): Promise<void> {
  try {
    if (transaction.length > maxStoredValueLength)
      throw new InvalidStoreValueError()
    const envelope = TxEnvelopeTempo.deserialize(transaction)
    if (!envelope.signature) throw new InvalidStoreValueError()
    TxEnvelopeTempo.hash(envelope as TxEnvelopeTempo.Signed)
    const written = await store.compareAndSet(
      submissionKey(hash, submissionId),
      null,
      transaction,
      { expiresAt: Date.now() + pendingOperationTtl },
    )
    if (!written) throw new InvalidStoreValueError()
  } catch (cause) {
    if (cause instanceof InvalidStoreValueError) throw cause
    throw new InvalidStoreValueError({ cause })
  }
}

/** Deserializes a multisig operation from storage. */
function deserialize(value: string): MultisigOperation.Operation {
  try {
    if (value.length > maxStoredValueLength) throw new InvalidStoreValueError()
    const operation = MultisigOperation.from(Json.parse(value) as never)
    assertHash(operation)
    return operation
  } catch (cause) {
    if (cause instanceof InvalidStoreValueError) throw cause
    throw new InvalidStoreValueError({ cause })
  }
}

/** Serializes a multisig operation for storage. */
function serialize(operation: MultisigOperation.Operation): string {
  try {
    const operation_ = MultisigOperation.from(operation)
    assertHash(operation_)
    const value = Json.stringify(operation_)
    if (value.length > maxStoredValueLength) throw new InvalidStoreValueError()
    return value
  } catch (cause) {
    if (cause instanceof InvalidStoreValueError) throw cause
    throw new InvalidStoreValueError({ cause })
  }
}

/** Verifies that the operation hash commits to its stored payload. */
function assertHash(operation: MultisigOperation.Operation) {
  const hash = MultisigOperation.getHash(
    operation.type === 'transaction'
      ? {
          account: operation.account,
          config: operation.config,
          transaction: operation.transaction,
          type: operation.type,
        }
      : {
          account: operation.account,
          config: operation.config,
          keyAuthorization: operation.keyAuthorization,
          type: operation.type,
        },
  )
  if (hash.toLowerCase() !== operation.hash.toLowerCase())
    throw new InvalidStoreValueError()
}

/** Returns the store key for an operation hash. */
function operationKey(hash: Hex.Hex) {
  return `multisig:operation:${hash.toLowerCase()}`
}

/** Returns the store key for a submission attempt. */
function submissionKey(hash: Hex.Hex, submissionId: Hex.Hex) {
  return `multisig:submission:${hash.toLowerCase()}:${submissionId.toLowerCase()}`
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
