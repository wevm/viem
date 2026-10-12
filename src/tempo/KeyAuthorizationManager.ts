import type { Address } from 'abitype'
import { KeyAuthorization } from 'ox/tempo'
import type { MaybePromise } from '../types/utils.js'
import * as Store from './Store.js'

/** Identifies a pending key authorization by account, access key, and chain. */
export type Key = {
  /** Account the access key acts for. */
  address: Address
  /** Access key address. */
  accessKey: Address
  /** Chain the authorization is for. */
  chainId: number
}

/** Pending key authorizations that the client attaches to an access key's next transaction. */
export type KeyAuthorizationManager = {
  /** Reads the pending authorization for a key. */
  get(key: Key): MaybePromise<KeyAuthorization.Signed | undefined>
  /** Removes the pending authorization for a key. */
  remove(key: Key): MaybePromise<void>
  /** Stores a pending authorization for a key. */
  set(key: Key, keyAuthorization: KeyAuthorization.Signed): MaybePromise<void>
}

/**
 * Creates a key authorization manager backed by a store.
 *
 * Entries use the same keys as the `Relay.keyAuthorization` plugin, so both can
 * share one store.
 *
 * @example
 * ```ts
 * import { Account, KeyAuthorizationManager, Store } from 'viem/tempo'
 *
 * const accessKey = Account.fromP256(privateKey, {
 *   access: root,
 *   keyAuthorizationManager: KeyAuthorizationManager.from({
 *     store: Store.session(),
 *   }),
 * })
 * ```
 *
 * @param options - Manager options.
 * @returns A key authorization manager.
 */
export function from(options: from.Options): KeyAuthorizationManager {
  const { store } = options
  return {
    async get(key) {
      const value = await store.getItem(getStoreKey(key))
      if (!value) return undefined
      try {
        return KeyAuthorization.deserialize(
          value as `0x${string}`,
        ) as KeyAuthorization.Signed
      } catch {
        return undefined
      }
    },
    async remove(key) {
      await store.removeItem(getStoreKey(key))
    },
    async set(key, keyAuthorization) {
      await store.setItem(
        getStoreKey(key),
        KeyAuthorization.serialize(keyAuthorization),
      )
    },
  }
}

export declare namespace from {
  type Options = {
    /** Store for pending key authorizations. */
    store: Store.Store
  }
}

/**
 * Creates a key authorization manager backed by a process-local memory store.
 *
 * @example
 * ```ts
 * import { KeyAuthorizationManager } from 'viem/tempo'
 *
 * const keyAuthorizationManager = KeyAuthorizationManager.memory()
 * ```
 *
 * @returns A key authorization manager.
 */
export function memory(): KeyAuthorizationManager {
  return from({ store: Store.memory() })
}

function getStoreKey(key: Key) {
  return [
    'keyAuthorization',
    key.chainId,
    key.address.toLowerCase(),
    key.accessKey.toLowerCase(),
  ].join(':')
}
