import type { Errors } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { watchEvent } from '../../../core/actions/contract/watchEvent.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'

/** Watches for receipt claimed events. */
export function watchClaimed<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: watchClaimed.Options = {},
): watchClaimed.ReturnType {
  return watchEvent(client, {
    ...options,
    abi: Abis.receivePolicyGuard,
    address: Addresses.receivePolicyGuard,
    eventName: 'ReceiptClaimed',
    strict: true,
  })
}

export namespace watchClaimed {
  export type Options = Omit<
    watchEvent.Options<typeof Abis.receivePolicyGuard, 'ReceiptClaimed', true>,
    'abi' | 'address' | 'eventName' | 'strict'
  >
  export type ReturnType = watchEvent.Watcher<
    typeof Abis.receivePolicyGuard,
    'ReceiptClaimed',
    true
  >
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
