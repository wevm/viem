import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import type * as Hex from '../../utils/Hex.js'
import * as Log from '../../utils/Log.js'

/**
 * Returns the full list of logs matching the event filter, from the filter's
 * `fromBlock` to its `toBlock` (independent of poll state).
 *
 * @example
 * ```ts twoslash
 * import { actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http()
 * })
 *
 * const filterId = await actions.createEventFilter(client, {
 *   address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
 * })
 * const logs = await actions.getFilterLogs(client, { filterId })
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 * @returns Event logs.
 */
export async function getFilterLogs<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: getFilterLogs.Options,
): getFilterLogs.ReturnType {
  const logs = await client.request({
    method: 'eth_getFilterLogs',
    params: [options.filterId],
  })
  return logs.map((log) => Log.fromRpc(log))
}

export declare namespace getFilterLogs {
  type Options = {
    /** Filter identifier returned from {@link actions.createEventFilter}. */
    filterId: Hex.Hex
  }

  type ReturnType = Promise<readonly Log.Log[]>

  type ErrorType = Log.fromRpc.ErrorType
}
