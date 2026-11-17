import { AbiEvent } from 'ox'
import type { Errors } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { watchEvent } from '../../../core/actions/contract/watchEvent.js'
import * as Abis from '../../Abis.js'
import type { TokenParameter } from '../../internal/types.js'
import { resolveToken } from '../../internal/utils.js'

/** Quote-token update events (staged and applied). */
const events = [
  AbiEvent.fromAbi(Abis.tip20, 'NextQuoteTokenSet'),
  AbiEvent.fromAbi(Abis.tip20, 'QuoteTokenUpdate'),
] as const

/**
 * Watches TIP-20 quote token update events for a token.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({ transport: http() })
 *
 * const watcher = Actions.token.watchUpdateQuoteToken(client, {
 *   token: '0x20c0000000000000000000000000000000000001',
 * })
 * watcher.onLogs((logs) => console.log(logs))
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns A watcher handle.
 */
export function watchUpdateQuoteToken<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: watchUpdateQuoteToken.Options,
): watchUpdateQuoteToken.ReturnType {
  const { token, ...rest } = options
  return watchEvent(client, {
    ...rest,
    abi: events,
    address: resolveToken(client, { token }).address,
    strict: true,
  }) as watchUpdateQuoteToken.ReturnType
}

export namespace watchUpdateQuoteToken {
  export type Options = Omit<
    watchEvent.Options<typeof events, undefined, true>,
    'abi' | 'address' | 'eventName' | 'strict'
  > &
    TokenParameter
  export type ReturnType = watchEvent.Watcher<typeof events, undefined, true>
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
