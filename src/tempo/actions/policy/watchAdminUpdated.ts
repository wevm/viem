import type { Errors } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { watchEvent } from '../../../core/actions/contract/watchEvent.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'

/** Watches `PolicyAdminUpdated` events on the TIP-403 registry. */
export function watchAdminUpdated<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: watchAdminUpdated.Options = {},
): watchAdminUpdated.ReturnType {
  return watchEvent(client, {
    ...options,
    abi: Abis.tip403Registry,
    address: Addresses.tip403Registry,
    eventName: 'PolicyAdminUpdated',
    strict: true,
  })
}

export namespace watchAdminUpdated {
  export type Options = Omit<
    watchEvent.Options<typeof Abis.tip403Registry, 'PolicyAdminUpdated', true>,
    'abi' | 'address' | 'eventName' | 'strict'
  >
  export type ReturnType = watchEvent.Watcher<
    typeof Abis.tip403Registry,
    'PolicyAdminUpdated',
    true
  >
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
