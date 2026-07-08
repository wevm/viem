import type { Errors } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { watchEvent } from '../../../core/actions/contract/watchEvent.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'

/**
 * Watches `KeyAuthorizationWitnessBurned` events on the account keychain.
 *
 * Emitted when a witness is burned (see {@link burnWitness}).
 *
 * [TIP-1053](https://tips.sh/1053)
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({ transport: http() })
 *
 * const watcher = Actions.accessKey.watchWitnessBurned(client)
 * watcher.onLogs((logs) => console.log(logs))
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns A watcher handle.
 */
export function watchWitnessBurned<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: watchWitnessBurned.Options = {},
): watchWitnessBurned.ReturnType {
  return watchEvent(client, {
    ...options,
    abi: Abis.accountKeychain,
    address: Addresses.accountKeychain,
    eventName: 'KeyAuthorizationWitnessBurned',
    strict: true,
  })
}

export namespace watchWitnessBurned {
  export type Options = Omit<
    watchEvent.Options<
      typeof Abis.accountKeychain,
      'KeyAuthorizationWitnessBurned',
      true
    >,
    'abi' | 'address' | 'eventName' | 'strict'
  >
  export type ReturnType = watchEvent.Watcher<
    typeof Abis.accountKeychain,
    'KeyAuthorizationWitnessBurned',
    true
  >
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
