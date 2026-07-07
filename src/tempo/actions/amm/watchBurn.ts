import type * as Errors from 'ox/Errors'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { watchEvent } from '../../../core/actions/contract/watchEvent.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'

/**
 * Watches `Burn` events on the fee AMM.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({ transport: http() })
 *
 * const watcher = Actions.amm.watchBurn(client)
 * watcher.onLogs((logs) => console.log(logs))
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns A watcher handle.
 */
export function watchBurn<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: watchBurn.Options = {},
): watchBurn.ReturnType {
  return watchEvent(client, {
    ...options,
    abi: Abis.feeAmm,
    address: Addresses.feeManager,
    eventName: 'Burn',
    strict: true,
  })
}

export namespace watchBurn {
  export type Options = Omit<
    watchEvent.Options<typeof Abis.feeAmm, 'Burn', true>,
    'abi' | 'address' | 'eventName' | 'strict'
  >
  export type ReturnType = watchEvent.Watcher<typeof Abis.feeAmm, 'Burn', true>
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
