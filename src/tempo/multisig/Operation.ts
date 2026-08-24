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

/** Updates a multisig operation, atomically when the store supports it. */
export async function update(
  store: Storage.Storage,
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
    let next: MultisigOperation.Operation
    try {
      next = MultisigOperation.from(await update(current))
    } catch (cause) {
      throw new InvalidStoreValueError({ cause })
    }
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

/** Deserializes a multisig operation from storage. */
export function deserialize(value: string): MultisigOperation.Operation {
  try {
    if (value.length > maxStoredValueLength) throw new InvalidStoreValueError()
    return MultisigOperation.from(Json.parse(value) as never)
  } catch (cause) {
    if (cause instanceof InvalidStoreValueError) throw cause
    throw new InvalidStoreValueError({ cause })
  }
}

/** Serializes a multisig operation for storage. */
export function serialize(operation: MultisigOperation.Operation): string {
  try {
    const value = Json.stringify(MultisigOperation.from(operation))
    if (value.length > maxStoredValueLength) throw new InvalidStoreValueError()
    return value
  } catch (cause) {
    if (cause instanceof InvalidStoreValueError) throw cause
    throw new InvalidStoreValueError({ cause })
  }
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
