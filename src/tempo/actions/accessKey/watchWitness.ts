import type { Errors } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { watchEvent } from '../../../core/actions/contract/watchEvent.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'

/**
 * Watches `KeyAuthorizationWitness` events on the account keychain.
 *
 * Emitted when a key is authorized with a `witness` (see {@link authorize}).
 *
 * [TIP-1053](https://tips.sh/1053)
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({ transport: http() })
 *
 * const watcher = Actions.accessKey.watchWitness(client)
 * watcher.onLogs((logs) => console.log(logs))
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns A watcher handle.
 */
export function watchWitness<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: watchWitness.Options = {},
): watchWitness.ReturnType {
  return watchEvent(client, {
    ...options,
    abi: Abis.accountKeychain,
    address: Addresses.accountKeychain,
    eventName: 'KeyAuthorizationWitness',
    strict: true,
  })
}

export namespace watchWitness {
  export type Options = Omit<
    watchEvent.Options<
      typeof Abis.accountKeychain,
      'KeyAuthorizationWitness',
      true
    >,
    'abi' | 'address' | 'eventName' | 'strict'
  >
  export type ReturnType = watchEvent.Watcher<
    typeof Abis.accountKeychain,
    'KeyAuthorizationWitness',
    true
  >
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
