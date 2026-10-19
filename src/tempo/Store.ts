import type { MaybePromise } from '../types/utils.js'

export type Store = {
  /** Atomically replaces `expected` with `value` when supported. */
  compareAndSet?: CompareAndSet | undefined
  /** Reads a value. */
  getItem(key: string): MaybePromise<string | null | undefined>
  /** Removes a value. */
  removeItem(key: string): MaybePromise<void>
  /** Writes a value. */
  setItem(key: string, value: string): MaybePromise<void>
}

/** Atomic compare-and-set operation. */
export type CompareAndSet = (
  key: string,
  expected: string | null,
  value: string,
  options?: CompareAndSet.Options | undefined,
) => MaybePromise<boolean>

export declare namespace CompareAndSet {
  /** Compare-and-set options. */
  export type Options = {
    /** Unix timestamp in milliseconds after which the value expires. */
    expiresAt?: number | undefined
  }
}

/** Store with atomic compare-and-set support. */
export type Atomic = Store & {
  /** Atomically replaces `expected` with `value` and applies its expiration. */
  compareAndSet: CompareAndSet
}

/**
 * Wraps a base store with an optional key prefix and request deduplication.
 * Concurrent `getItem` calls for the same key share one in-flight promise.
 *
 * @example
 * ```ts
 * import { Store } from 'viem/tempo'
 *
 * const store = Store.from(Store.memory(), { key: 'tempo' })
 * await store.setItem('foo', 'bar')
 * // stored under "tempo:foo"
 * ```
 */
export function from(store: Atomic, options?: from.Options | undefined): Atomic
export function from(store: Store, options?: from.Options | undefined): Store
export function from(store: Store, options: from.Options = {}): Store {
  const { key } = options
  const prefix = key ? `${key}:` : ''
  const inflight = new Map<string, Promise<string | null | undefined>>()
  const compareAndSet = store.compareAndSet?.bind(store)
  return {
    ...(compareAndSet
      ? {
          compareAndSet(k, expected, value, options) {
            const fullKey = `${prefix}${k}`
            inflight.delete(fullKey)
            return compareAndSet(fullKey, expected, value, options)
          },
        }
      : {}),
    getItem(k) {
      const fullKey = `${prefix}${k}`
      const existing = inflight.get(fullKey)
      if (existing) return existing
      const result = Promise.resolve(store.getItem(fullKey)).finally(() => {
        inflight.delete(fullKey)
      })
      inflight.set(fullKey, result)
      return result
    },
    setItem(k, value) {
      const fullKey = `${prefix}${k}`
      inflight.delete(fullKey)
      return store.setItem(fullKey, value)
    },
    removeItem(k) {
      const fullKey = `${prefix}${k}`
      inflight.delete(fullKey)
      return store.removeItem(fullKey)
    },
  }
}

export declare namespace from {
  /** Store options. */
  type Options = {
    /** Key prefix prepended to all store keys. */
    key?: string | undefined
  }
}

/** Creates an in-memory store backed by a `Map`. */
export function memory(options: from.Options = {}): Atomic {
  const store = new Map<
    string,
    { expiresAt: number | undefined; value: string }
  >()
  const get = (key: string) => {
    const entry = store.get(key)
    if (!entry) return undefined
    if (entry.expiresAt === undefined || entry.expiresAt > Date.now())
      return entry
    store.delete(key)
    return undefined
  }
  return from(
    {
      compareAndSet(key, expected, value, options) {
        if ((get(key)?.value ?? null) !== expected) return false
        store.set(key, { expiresAt: options?.expiresAt, value })
        return true
      },
      getItem(key) {
        return get(key)?.value ?? null
      },
      setItem(key, value) {
        store.set(key, { expiresAt: undefined, value })
      },
      removeItem(key) {
        store.delete(key)
      },
    },
    options,
  )
}

/** Creates a store backed by `globalThis.sessionStorage`. */
export function session(options: from.Options = {}): Store {
  return from(
    {
      getItem(key) {
        return globalThis.sessionStorage.getItem(key)
      },
      setItem(key, value) {
        try {
          globalThis.sessionStorage.setItem(key, value)
        } catch {}
      },
      removeItem(key) {
        globalThis.sessionStorage.removeItem(key)
      },
    },
    options,
  )
}

let _default: Store | undefined

/**
 * Returns the default store for the current environment.
 *
 * Returns a singleton so that the zone transport and actions share the
 * same instance without requiring explicit plumbing.
 *
 * - Browser: `sessionStorage`
 * - Server/unsupported: in-memory `Map`-based store
 */
export function defaultStore(): Store {
  if (_default) return _default
  try {
    if (globalThis.sessionStorage) _default = session()
  } catch {}
  _default ??= memory()
  return _default
}
