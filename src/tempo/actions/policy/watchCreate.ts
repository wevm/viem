import type { Errors } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { watchEvent } from '../../../core/actions/contract/watchEvent.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'

/** Watches `PolicyCreated` events on the TIP-403 registry. */
export function watchCreate<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: watchCreate.Options = {},
): watchCreate.ReturnType {
  return watchEvent(client, {
    ...options,
    abi: Abis.tip403Registry,
    address: Addresses.tip403Registry,
    eventName: 'PolicyCreated',
    strict: true,
  })
}

export namespace watchCreate {
  export type Options = Omit<
    watchEvent.Options<typeof Abis.tip403Registry, 'PolicyCreated', true>,
    'abi' | 'address' | 'eventName' | 'strict'
  >
  export type ReturnType = watchEvent.Watcher<
    typeof Abis.tip403Registry,
    'PolicyCreated',
    true
  >
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
