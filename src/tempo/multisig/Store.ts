import { BaseError } from '../../errors/base.js'
import type * as Operation from './Operation.js'

/** Storage used to coordinate multisig operations. */
export type Store = {
  /** Atomically replaces `expected` with `value`; persistent stores own serialization. */
  compareAndSet(
    key: string,
    expected: Operation.Operation | null,
    value: Operation.Operation,
  ): Promise<boolean>
  /** Reads a multisig operation. */
  get(key: string): Promise<Operation.Operation | null>
}

/**
 * Creates a multisig store from a storage implementation.
 *
 * @param options - Store options.
 * @returns The multisig store.
 */
export function from(options: from.Options): Store {
  return options.source
}

export declare namespace from {
  /** Options for {@link from}. */
  export type Options = {
    /** Storage implementation that owns any required serialization. */
    source: Store
  }
}

/**
 * Creates an in-memory multisig store for local development and tests.
 *
 * @returns The in-memory multisig store.
 */
export function memory(): Store {
  const values = new Map<string, Operation.Operation>()
  return from({
    source: {
      async compareAndSet(key, expected, value) {
        if ((values.get(key) ?? null) !== expected) return false
        values.set(key, value)
        return true
      },
      async get(key) {
        return values.get(key) ?? null
      },
    },
  })
}

/** Type returned by {@link InvalidStoreValueError}. */
export type InvalidStoreValueErrorType = InvalidStoreValueError & {
  /** Error name. */
  name: 'MultisigStore.InvalidStoreValueError'
}

/** Thrown when a stored multisig operation is malformed or unsupported. */
export class InvalidStoreValueError extends BaseError {
  /** Creates an invalid store value error. */
  constructor(options: InvalidStoreValueError.Options = {}) {
    super('Stored multisig operation is malformed or unsupported.', {
      cause: options.cause as Error | undefined,
      name: 'MultisigStore.InvalidStoreValueError',
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
      name: 'MultisigStore.StoreConflictError',
    })
  }
}
