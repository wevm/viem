import type { MaybePromise } from '../types/utils.js'

export type Storage = {
  /** Atomically replaces `expected` with `value` when supported. */
  compareAndSet?(
    key: string,
    expected: string | null,
    value: string,
  ): MaybePromise<boolean>
  /** Reads a value. */
  getItem(key: string): MaybePromise<string | null | undefined>
  /** Removes a value. */
  removeItem(key: string): MaybePromise<void>
  /** Writes a value. */
  setItem(key: string, value: string): MaybePromise<void>
}

/**
 * Wraps a base store with an optional key prefix and request
 * deduplication — concurrent `getItem` calls for the same key share
 * a single in-flight promise.
 *
 * @example
 * ```ts
 * import { Storage } from 'viem/tempo'
 *
 * const store = Storage.from(Storage.memory(), { key: 'tempo' })
 * await store.setItem('foo', 'bar')
 * // stored under "tempo:foo"
 * ```
 */
export function from(store: Storage, options: from.Options = {}): Storage {
  const { key } = options
  const prefix = key ? `${key}:` : ''
  const inflight = new Map<string, Promise<string | null | undefined>>()
  const compareAndSet = store.compareAndSet?.bind(store)
  return {
    ...(compareAndSet
      ? {
          compareAndSet(k, expected, value) {
            const fullKey = `${prefix}${k}`
            inflight.delete(fullKey)
            return compareAndSet(fullKey, expected, value)
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
  type Options = {
    /** Key prefix prepended to all store keys. */
    key?: string | undefined
  }
}

/** Creates an in-memory store backed by a `Map`. */
export function memory(options: from.Options = {}): Storage {
  const store = new Map<string, string>()
  return from(
    {
      compareAndSet(key, expected, value) {
        if ((store.get(key) ?? null) !== expected) return false
        store.set(key, value)
        return true
      },
      getItem(key) {
        return store.get(key) ?? null
      },
      setItem(key, value) {
        store.set(key, value)
      },
      removeItem(key) {
        store.delete(key)
      },
    },
    options,
  )
}

/** Creates a store backed by `globalThis.sessionStorage`. */
export function session(options: from.Options = {}): Storage {
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

let _default: Storage | undefined

/**
 * Returns the default store for the current environment.
 *
 * Returns a singleton so that the zone transport and actions share the
 * same instance without requiring explicit plumbing.
 *
 * - Browser: `sessionStorage`
 * - Server/unsupported: in-memory `Map`-based store
 */
export function defaultStorage(): Storage {
  if (_default) return _default
  try {
    if (globalThis.sessionStorage) _default = session()
  } catch {}
  _default ??= memory()
  return _default
}
