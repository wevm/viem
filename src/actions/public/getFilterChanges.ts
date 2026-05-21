import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import type * as Hex from '../../utils/Hex.js'
import * as Log from '../../utils/Log.js'

/**
 * Returns a list of logs or hashes accumulated by the filter since the last
 * poll. Use the result discriminated by filter type:
 *
 * - block filter -> array of block hashes
 * - pending transaction filter -> array of transaction hashes
 * - event filter -> array of {@link Log.Log} entries
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
 * const hashes = await actions.getFilterChanges(client, { filterId })
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 * @returns Logs or hashes that have changed since the last poll.
 */
export async function getFilterChanges<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: getFilterChanges.Options,
): getFilterChanges.ReturnType {
  const changes = await client.request({
    method: 'eth_getFilterChanges',
    params: [options.filterId],
  })
  if (changes.length === 0) return []
  if (typeof changes[0] === 'string') return changes as readonly Hex.Hex[]
  return (changes as readonly Log.Rpc[]).map((log) => Log.fromRpc(log))
}

export declare namespace getFilterChanges {
  type Options = {
    /** Filter identifier returned from a `create*Filter` action. */
    filterId: Hex.Hex
  }

  type ReturnType = Promise<readonly Log.Log[] | readonly Hex.Hex[]>

  type ErrorType = Log.fromRpc.ErrorType
}
