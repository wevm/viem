import type * as Errors from 'ox/Errors'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { watchEvent } from '../../../core/actions/contract/watchEvent.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'

/**
 * Watches TIP-20 `TokenCreated` events from the token factory.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({ transport: http() })
 *
 * const watcher = Actions.token.watchCreate(client, {})
 * watcher.onLogs((logs) => console.log(logs))
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns A watcher handle.
 */
export function watchCreate<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: watchCreate.Options = {},
): watchCreate.ReturnType {
  return watchEvent(client, {
    ...options,
    abi: Abis.tip20Factory,
    address: Addresses.tip20Factory,
    eventName: 'TokenCreated',
    strict: true,
  })
}

export namespace watchCreate {
  export type Options = Omit<
    watchEvent.Options<typeof Abis.tip20Factory, 'TokenCreated', true>,
    'abi' | 'address' | 'eventName' | 'strict'
  >
  export type ReturnType = watchEvent.Watcher<
    typeof Abis.tip20Factory,
    'TokenCreated',
    true
  >
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
