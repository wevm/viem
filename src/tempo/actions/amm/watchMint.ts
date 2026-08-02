import type { Errors } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { watchEvent } from '../../../core/actions/contract/watchEvent.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'

/**
 * Watches `Mint` events on the fee AMM.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({ transport: http() })
 *
 * const watcher = Actions.amm.watchMint(client)
 * watcher.onLogs((logs) => console.log(logs))
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns A watcher handle.
 */
export function watchMint<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: watchMint.Options = {},
): watchMint.ReturnType {
  return watchEvent(client, {
    ...options,
    abi: Abis.feeAmm,
    address: Addresses.feeManager,
    eventName: 'Mint',
    strict: true,
  })
}

export namespace watchMint {
  export type Options = Omit<
    watchEvent.Options<typeof Abis.feeAmm, 'Mint', true>,
    'abi' | 'address' | 'eventName' | 'strict'
  >
  export type ReturnType = watchEvent.Watcher<typeof Abis.feeAmm, 'Mint', true>
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
