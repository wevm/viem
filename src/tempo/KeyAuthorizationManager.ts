import type { Address } from 'ox'
import type { KeyAuthorization } from 'ox/tempo'

import type { MaybePromise } from '../core/internal/types.js'

/** Cache key identifying a signed key authorization. */
export type Key = {
  /** Root account address the authorization is bound to. */
  address: Address.Address
  /** Access key address. */
  accessKey: Address.Address
  /** Chain ID. */
  chainId: number
}

/** Store for signed key authorizations, keyed by account, access key, and chain. */
export type KeyAuthorizationManager = {
  get(key: Key): MaybePromise<KeyAuthorization.Signed | undefined>
  remove(key: Key): MaybePromise<void>
  set(key: Key, keyAuthorization: KeyAuthorization.Signed): MaybePromise<void>
}

/**
 * Instantiates a key authorization manager from a source.
 *
 * @example
 * ```ts
 * import { KeyAuthorizationManager } from 'viem/tempo'
 *
 * const manager = KeyAuthorizationManager.from({
 *   source: {
 *     get(key) { … },
 *     remove(key) { … },
 *     set(key, keyAuthorization) { … },
 *   },
 * })
 * ```
 */
export function from(options: from.Options): KeyAuthorizationManager {
  return options.source
}

export declare namespace from {
  type Options = {
    /** Source implementation backing the manager. */
    source: KeyAuthorizationManager
  }
}

/**
 * Creates an in-memory key authorization manager backed by a `Map`.
 *
 * @example
 * ```ts
 * import { KeyAuthorizationManager } from 'viem/tempo'
 *
 * const manager = KeyAuthorizationManager.memory()
 * ```
 */
export function memory(): KeyAuthorizationManager {
  const keyAuthorizations = new Map<string, KeyAuthorization.Signed>()

  return from({
    source: {
      get(key) {
        return keyAuthorizations.get(serializeKey(key))
      },
      remove(key) {
        keyAuthorizations.delete(serializeKey(key))
      },
      set(key, keyAuthorization) {
        keyAuthorizations.set(serializeKey(key), keyAuthorization)
      },
    },
  })
}

function serializeKey(key: Key) {
  return [
    key.chainId,
    key.address.toLowerCase(),
    key.accessKey.toLowerCase(),
  ].join(':')
}
