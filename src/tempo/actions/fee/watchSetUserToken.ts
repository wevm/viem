import type * as Errors from 'ox/Errors'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { watchEvent } from '../../../core/actions/contract/watchEvent.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'

/**
 * Watches `UserTokenSet` events on the fee manager.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({ transport: http() })
 *
 * const watcher = Actions.fee.watchSetUserToken(client)
 * watcher.onLogs((logs) => console.log(logs))
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns A watcher handle.
 */
export function watchSetUserToken<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: watchSetUserToken.Options = {},
): watchSetUserToken.ReturnType {
  return watchEvent(client, {
    ...options,
    abi: Abis.feeManager,
    address: Addresses.feeManager,
    eventName: 'UserTokenSet',
    strict: true,
  })
}

export namespace watchSetUserToken {
  export type Options = Omit<
    watchEvent.Options<typeof Abis.feeManager, 'UserTokenSet', true>,
    'abi' | 'address' | 'eventName' | 'strict'
  >
  export type ReturnType = watchEvent.Watcher<
    typeof Abis.feeManager,
    'UserTokenSet',
    true
  >
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
