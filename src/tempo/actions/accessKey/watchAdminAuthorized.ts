import type { Errors } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { watchEvent } from '../../../core/actions/contract/watchEvent.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'

/**
 * Watches `AdminKeyAuthorized` events on the account keychain.
 *
 * Emitted when an admin key is authorized (see {@link authorize} with
 * `admin: true`).
 *
 * [TIP-1049](https://tips.sh/1049)
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({ transport: http() })
 *
 * const watcher = Actions.accessKey.watchAdminAuthorized(client)
 * watcher.onLogs((logs) => console.log(logs))
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns A watcher handle.
 */
export function watchAdminAuthorized<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: watchAdminAuthorized.Options = {},
): watchAdminAuthorized.ReturnType {
  return watchEvent(client, {
    ...options,
    abi: Abis.accountKeychain,
    address: Addresses.accountKeychain,
    eventName: 'AdminKeyAuthorized',
    strict: true,
  })
}

export namespace watchAdminAuthorized {
  export type Options = Omit<
    watchEvent.Options<typeof Abis.accountKeychain, 'AdminKeyAuthorized', true>,
    'abi' | 'address' | 'eventName' | 'strict'
  >
  export type ReturnType = watchEvent.Watcher<
    typeof Abis.accountKeychain,
    'AdminKeyAuthorized',
    true
  >
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
