import type * as Errors from 'ox/Errors'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { watchEvent } from '../../../core/actions/contract/watchEvent.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'

/** Watches for blocked transfer events. */
export function watchBlocked<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: watchBlocked.Options = {},
): watchBlocked.ReturnType {
  return watchEvent(client, {
    ...options,
    abi: Abis.receivePolicyGuard,
    address: Addresses.receivePolicyGuard,
    eventName: 'TransferBlocked',
    strict: true,
  })
}

export namespace watchBlocked {
  export type Options = Omit<
    watchEvent.Options<typeof Abis.receivePolicyGuard, 'TransferBlocked', true>,
    'abi' | 'address' | 'eventName' | 'strict'
  >
  export type ReturnType = watchEvent.Watcher<
    typeof Abis.receivePolicyGuard,
    'TransferBlocked',
    true
  >
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
