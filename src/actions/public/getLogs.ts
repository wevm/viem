import type * as Address from 'ox/Address'

import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import type * as Block from '../../utils/Block.js'
import type * as Filter from '../../utils/Filter.js'
import * as Hex from '../../utils/Hex.js'
import * as Log from '../../utils/Log.js'

/**
 * Returns a list of event logs matching the provided filter.
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
 * const logs = await actions.getLogs(client, {
 *   address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
 * })
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 * @returns Event logs.
 */
export async function getLogs<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: getLogs.Options = {},
): getLogs.ReturnType {
  const { address, blockHash, fromBlock, toBlock, topics } = options
  const filter = (() => {
    if (blockHash) return { address, topics, blockHash }
    return {
      address,
      topics,
      fromBlock:
        typeof fromBlock === 'bigint' ? Hex.fromNumber(fromBlock) : fromBlock,
      toBlock: typeof toBlock === 'bigint' ? Hex.fromNumber(toBlock) : toBlock,
    }
  })()
  const logs = await client.request({
    method: 'eth_getLogs',
    params: [filter],
  })
  return logs.map((log) => Log.fromRpc(log))
}

export declare namespace getLogs {
  type Options = {
    /** Address or list of addresses from which logs originated. */
    address?: Address.Address | readonly Address.Address[] | undefined
    /** Topics to filter for. */
    topics?: Filter.Topics | undefined
  } & (
    | {
        /** Block number or tag after which to include logs. */
        fromBlock?: bigint | Block.Tag | undefined
        /** Block number or tag before which to include logs. */
        toBlock?: bigint | Block.Tag | undefined
        blockHash?: undefined
      }
    | {
        fromBlock?: undefined
        toBlock?: undefined
        /** Hash of block to include logs from. */
        blockHash?: Hex.Hex | undefined
      }
  )

  type ReturnType = Promise<readonly Log.Log[]>

  type ErrorType = Hex.fromNumber.ErrorType | Log.fromRpc.ErrorType
}
