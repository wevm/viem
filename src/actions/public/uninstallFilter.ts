import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import type * as Hex from '../../utils/Hex.js'

/**
 * Uninstalls a filter previously created by
 * {@link actions.createBlockFilter}, {@link actions.createEventFilter}, or
 * {@link actions.createPendingTransactionFilter}.
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
 * const filterId = await actions.createBlockFilter(client)
 * const uninstalled = await actions.uninstallFilter(client, { filterId })
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 * @returns `true` if the filter was uninstalled, `false` otherwise.
 */
export async function uninstallFilter<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: uninstallFilter.Options,
): uninstallFilter.ReturnType {
  return await client.request({
    method: 'eth_uninstallFilter',
    params: [options.filterId],
  })
}

export declare namespace uninstallFilter {
  type Options = {
    /** Filter identifier returned from a `create*Filter` action. */
    filterId: Hex.Hex
  }

  type ReturnType = Promise<boolean>
}
