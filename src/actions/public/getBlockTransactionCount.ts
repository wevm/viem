import * as Hex from 'ox/Hex'

import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import type * as Block from '../../utils/Block.js'

/**
 * Returns the number of transactions in a block.
 *
 * @example
 * ```ts twoslash
 * import { Client, http } from 'viem'
 * import * as actions from 'viem/actions'
 *
 * const client = Client.create({
 *   transport: http('https://1.rpc.thirdweb.com'),
 * })
 *
 * const count = await actions.getBlockTransactionCount(client)
 * // @log: 42n
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 * @returns Block transaction count.
 */
export async function getBlockTransactionCount<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: getBlockTransactionCount.Options = {},
): getBlockTransactionCount.ReturnType {
  const { blockHash, blockNumber, blockTag = 'latest' } = options
  const count = blockHash
    ? await client.request(
        {
          method: 'eth_getBlockTransactionCountByHash',
          params: [blockHash],
        },
        { dedupe: true },
      )
    : await client.request(
        {
          method: 'eth_getBlockTransactionCountByNumber',
          params: [
            blockNumber !== undefined ? Hex.fromNumber(blockNumber) : blockTag,
          ],
        },
        { dedupe: blockNumber !== undefined },
      )
  return Hex.toBigInt(count)
}

export declare namespace getBlockTransactionCount {
  type Options =
    | {
        /** Block hash. */
        blockHash?: Hex.Hex | undefined
        blockNumber?: undefined
        blockTag?: undefined
      }
    | {
        blockHash?: undefined
        /** Block number. */
        blockNumber?: bigint | undefined
        blockTag?: undefined
      }
    | {
        blockHash?: undefined
        blockNumber?: undefined
        /** Block tag. */
        blockTag?: Block.Tag | undefined
      }

  type ReturnType = Promise<bigint>

  type ErrorType = Hex.fromNumber.ErrorType | Hex.toBigInt.ErrorType
}
