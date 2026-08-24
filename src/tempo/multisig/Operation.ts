import type * as Hex from 'ox/Hex'
import * as Json from 'ox/Json'
import { MultisigOperation } from 'ox/tempo'
import { BaseError } from '../../errors/base.js'
import type * as Storage from '../Storage.js'

/** Bounds parsing and serialization work if a store returns unexpectedly large data. */
const maxStoredValueLength = 1_048_576

/** Prevents sustained compare-and-set contention from retrying indefinitely. */
const maxUpdateAttempts = 32

/** Reads a persisted multisig operation. */
export async function read(
  store: Storage.Storage,
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
  store: Storage.Atomic,
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
    if (await store.compareAndSet(key, value, serialized)) return next
  }
  throw new StoreConflictError()
}

/** Deserializes a multisig operation from storage. */
export function deserialize(value: string): MultisigOperation.Operation {
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
export function serialize(operation: MultisigOperation.Operation): string {
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
          configVersion: operation.configVersion,
          transaction: operation.transaction,
          type: operation.type,
        }
      : {
          account: operation.account,
          configVersion: operation.configVersion,
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
