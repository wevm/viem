import type { Errors } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { watchEvent } from '../../../core/actions/contract/watchEvent.js'
import * as Abis from '../../Abis.js'
import type { TokenParameter } from '../../internal/types.js'
import { resolveToken } from '../../internal/utils.js'

/**
 * Watches TIP-20 `Approval` events for a token.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({ transport: http() })
 *
 * const watcher = Actions.token.watchApprove(client, {
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * watcher.onLogs((logs) => console.log(logs))
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns A watcher handle.
 */
export function watchApprove<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: watchApprove.Options,
): watchApprove.ReturnType {
  const { token, ...rest } = options
  return watchEvent(client, {
    ...rest,
    abi: Abis.tip20,
    address: resolveToken(client, { token }).address,
    eventName: 'Approval',
    strict: true,
  })
}

export namespace watchApprove {
  export type Options = Omit<
    watchEvent.Options<typeof Abis.tip20, 'Approval', true>,
    'abi' | 'address' | 'eventName' | 'strict'
  > &
    TokenParameter
  export type ReturnType = watchEvent.Watcher<
    typeof Abis.tip20,
    'Approval',
    true
  >
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
