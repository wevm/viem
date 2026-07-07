import type * as Errors from 'ox/Errors'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { watchEvent } from '../../../core/actions/contract/watchEvent.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'

/**
 * Watches `NonceIncremented` events on the nonce manager (2D nonces,
 * TIP-1009).
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({ transport: http() })
 *
 * const watcher = Actions.nonce.watchIncremented(client)
 * watcher.onLogs((logs) => console.log(logs))
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns A watcher handle.
 */
export function watchIncremented<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: watchIncremented.Options = {},
): watchIncremented.ReturnType {
  return watchEvent(client, {
    ...options,
    abi: Abis.nonce,
    address: Addresses.nonceManager,
    eventName: 'NonceIncremented',
    strict: true,
  })
}

export namespace watchIncremented {
  export type Options = Omit<
    watchEvent.Options<typeof Abis.nonce, 'NonceIncremented', true>,
    'abi' | 'address' | 'eventName' | 'strict'
  >
  export type ReturnType = watchEvent.Watcher<
    typeof Abis.nonce,
    'NonceIncremented',
    true
  >
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
