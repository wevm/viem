import type * as Errors from 'ox/Errors'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { watchEvent } from '../../../core/actions/contract/watchEvent.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'

/**
 * Watches for order filled events.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({ transport: http() })
 *
 * const watcher = Actions.dex.watchOrderFilled(client)
 * watcher.onLogs((logs) => console.log(logs))
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns A watcher handle.
 */
export function watchOrderFilled<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: watchOrderFilled.Options = {},
): watchOrderFilled.ReturnType {
  return watchEvent(client, {
    ...options,
    abi: Abis.stablecoinDex,
    address: Addresses.stablecoinDex,
    eventName: 'OrderFilled',
    strict: true,
  })
}

export namespace watchOrderFilled {
  export type Options = Omit<
    watchEvent.Options<typeof Abis.stablecoinDex, 'OrderFilled', true>,
    'abi' | 'address' | 'eventName' | 'strict'
  >
  export type ReturnType = watchEvent.Watcher<
    typeof Abis.stablecoinDex,
    'OrderFilled',
    true
  >
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
