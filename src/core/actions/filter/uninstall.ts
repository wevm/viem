import type * as Errors from 'ox/Errors'

import type * as Client from '../../Client.js'
import type { Filter } from './Filter.js'

/**
 * Destroys a filter (`eth_uninstallFilter`). Returns whether the filter was
 * successfully uninstalled.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * // `filter` is returned from a `create*Filter` action.
 * const uninstalled = await Actions.filter.uninstall(client, { filter })
 * ```
 */
export async function uninstall(
  _client: Client.Client,
  options: uninstall.Options,
): Promise<uninstall.ReturnType> {
  const { filter } = options
  return filter.request({
    method: 'eth_uninstallFilter',
    params: [filter.id],
  })
}

export declare namespace uninstall {
  type Options = {
    /** Filter to destroy. */
    filter: Filter
  }

  type ReturnType = boolean

  type ErrorType = Errors.GlobalErrorType
}
