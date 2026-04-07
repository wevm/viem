/**
 * Storage interface for persisting zone authorization tokens.
 *
 * Compatible with wagmi's `BaseStorage` interface — `window.localStorage`,
 * `window.sessionStorage`, or any wagmi-compatible storage works directly.
 */
export type Storage = {
  getItem(
    key: string,
  ): string | null | undefined | Promise<string | null | undefined>
  setItem(key: string, value: string): void | Promise<void>
  removeItem(key: string): void | Promise<void>
}

/**
 * Wraps a base storage with a key prefix.
 *
 * @example
 * ```ts
 * import * as Storage from 'viem/tempo/zones'
 *
 * const storage = Storage.from(Storage.memory(), { key: 'tempo' })
 * await storage.setItem('foo', 'bar')
 * // stored under "tempo:foo"
 * ```
 */
export function from(storage: Storage, options: from.Options = {}): Storage {
  const { key } = options
  if (!key) return storage
  const prefix = `${key}:`
  return {
    getItem(k) {
      return storage.getItem(`${prefix}${k}`)
    },
    setItem(k, value) {
      return storage.setItem(`${prefix}${k}`, value)
    },
    removeItem(k) {
      return storage.removeItem(`${prefix}${k}`)
    },
  }
}

export declare namespace from {
  type Options = {
    /** Key prefix prepended to all storage keys. */
    key?: string | undefined
  }
}

/** Creates an in-memory storage backed by a `Map`. */
export function memory(options: from.Options = {}): Storage {
  const store = new Map<string, string>()
  return from(
    {
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

/** Creates a storage backed by `globalThis.sessionStorage`. */
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
 * Returns the default storage for the current environment.
 *
 * Returns a singleton so that the zone transport and actions share the
 * same instance without requiring explicit plumbing.
 *
 * - Browser: `sessionStorage`
 * - Server/unsupported: in-memory `Map`-based storage
 */
export function defaultStorage(): Storage {
  if (_default) return _default
  if (
    typeof globalThis !== 'undefined' &&
    'sessionStorage' in globalThis &&
    globalThis.sessionStorage
  )
    _default = session()
  else _default = memory()
  return _default
}
