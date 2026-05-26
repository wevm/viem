import type { Address } from 'abitype'
import type { KeyAuthorization } from 'ox/tempo'
import type { MaybePromise } from '../types/utils.js'

export type Key = {
  address: Address
  accessKey: Address
  chainId: number
}

export type KeyAuthorizationManager = {
  get(key: Key): MaybePromise<KeyAuthorization.Signed | undefined>
  remove(key: Key): MaybePromise<void>
  set(
    key: Key & { keyAuthorization: KeyAuthorization.Signed },
  ): MaybePromise<void>
}

export type Source = KeyAuthorizationManager

export type CreateParameters = {
  source: Source
}

export function createKeyAuthorizationManager(
  parameters: CreateParameters,
): KeyAuthorizationManager {
  return parameters.source
}

export const create = createKeyAuthorizationManager

export function memory(): KeyAuthorizationManager {
  const keyAuthorizations = new Map<string, KeyAuthorization.Signed>()

  return createKeyAuthorizationManager({
    source: {
      get(key) {
        return keyAuthorizations.get(serializeKey(key))
      },
      remove(key) {
        keyAuthorizations.delete(serializeKey(key))
      },
      set({ keyAuthorization, ...key }) {
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
