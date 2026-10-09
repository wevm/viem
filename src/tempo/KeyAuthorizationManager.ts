import type { Address } from 'abitype'
import type { KeyAuthorization } from 'ox/tempo'
import type { MaybePromise } from '../types/utils.js'

/** @deprecated Use the `Relay.keyAuthorization` relay plugin instead. */
export type Key = {
  address: Address
  accessKey: Address
  chainId: number
}

/** @deprecated Use the `Relay.keyAuthorization` relay plugin instead. */
export type KeyAuthorizationManager = {
  get(key: Key): MaybePromise<KeyAuthorization.Signed | undefined>
  remove(key: Key): MaybePromise<void>
  set(key: Key, keyAuthorization: KeyAuthorization.Signed): MaybePromise<void>
}

/** @deprecated Use the `Relay.keyAuthorization` relay plugin instead. */
export function from(options: from.Options): KeyAuthorizationManager {
  return options.source
}

export declare namespace from {
  type Options = {
    source: KeyAuthorizationManager
  }
}

/** @deprecated Use the `Relay.keyAuthorization` relay plugin instead. */
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
