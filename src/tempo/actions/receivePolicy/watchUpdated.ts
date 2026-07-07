import type * as Errors from 'ox/Errors'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { watchEvent } from '../../../core/actions/contract/watchEvent.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'

/** Watches for receive policy update events. */
export function watchUpdated<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: watchUpdated.Options = {},
): watchUpdated.ReturnType {
  return watchEvent(client, {
    ...options,
    abi: Abis.tip403Registry,
    address: Addresses.tip403Registry,
    eventName: 'ReceivePolicyUpdated',
    strict: true,
  })
}

export namespace watchUpdated {
  export type Options = Omit<
    watchEvent.Options<
      typeof Abis.tip403Registry,
      'ReceivePolicyUpdated',
      true
    >,
    'abi' | 'address' | 'eventName' | 'strict'
  >
  export type ReturnType = watchEvent.Watcher<
    typeof Abis.tip403Registry,
    'ReceivePolicyUpdated',
    true
  >
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
