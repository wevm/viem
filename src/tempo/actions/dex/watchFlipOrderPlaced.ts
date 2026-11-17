import type { Errors } from 'ox'

import type * as Chain from '../../../core/Chain.js'
import type * as Client from '../../../core/Client.js'
import { watchEvent } from '../../../core/actions/contract/watchEvent.js'
import * as Abis from '../../Abis.js'
import * as Addresses from '../../Addresses.js'

/**
 * Watches for flip order placed events.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem/tempo'
 *
 * const client = Client.create({ transport: http() })
 *
 * const watcher = Actions.dex.watchFlipOrderPlaced(client)
 * watcher.onLogs((logs) => console.log(logs))
 * ```
 *
 * @param client - Client.
 * @param options - Options.
 * @returns A watcher handle.
 */
export function watchFlipOrderPlaced<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: watchFlipOrderPlaced.Options = {},
): watchFlipOrderPlaced.ReturnType {
  const watcher = watchEvent(client, {
    ...options,
    abi: Abis.stablecoinDex,
    address: Addresses.stablecoinDex,
    eventName: 'OrderPlaced',
    strict: true,
  }) as watchFlipOrderPlaced.ReturnType

  // `isFlipOrder` is not an indexed event argument, so flip orders are
  // filtered client-side after decoding.
  type Logs = Parameters<
    Parameters<watchFlipOrderPlaced.ReturnType['onLogs']>[0]
  >[0]
  const filter = (logs: Logs) => logs.filter((log) => log.args.isFlipOrder)

  return {
    onLogs(fn) {
      return watcher.onLogs((logs) => {
        const flips = filter(logs)
        if (flips.length > 0) fn(flips)
      })
    },
    onError: watcher.onError,
    off: watcher.off,
    async *[Symbol.asyncIterator]() {
      for await (const { logs } of watcher) {
        const flips = filter(logs)
        if (flips.length > 0) yield { logs: flips }
      }
    },
  }
}

export namespace watchFlipOrderPlaced {
  export type Options = Omit<
    watchEvent.Options<typeof Abis.stablecoinDex, 'OrderPlaced', true>,
    'abi' | 'address' | 'eventName' | 'strict'
  >
  export type ReturnType = watchEvent.Watcher<
    typeof Abis.stablecoinDex,
    'OrderPlaced',
    true
  >
  // TODO: exhaustive error type
  export type ErrorType = Errors.GlobalErrorType
}
