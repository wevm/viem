import type * as Errors from 'ox/Errors'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { watchEvent } from '../../../core/actions/contract/watchEvent.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'

/** Watches for receipt burned events. */
export function watchBurned<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: watchBurned.Options = {},
): watchBurned.ReturnType {
  return watchEvent(client, {
    ...options,
    abi: Abis.receivePolicyGuard,
    address: Addresses.receivePolicyGuard,
    eventName: 'ReceiptBurned',
    strict: true,
  })
}

export namespace watchBurned {
  export type Options = Omit<
    watchEvent.Options<typeof Abis.receivePolicyGuard, 'ReceiptBurned', true>,
    'abi' | 'address' | 'eventName' | 'strict'
  >
  export type ReturnType = watchEvent.Watcher<
    typeof Abis.receivePolicyGuard,
    'ReceiptBurned',
    true
  >
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
