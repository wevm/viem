import { type Block, type Errors, Hex } from 'ox'

import type * as Client from '../../Client.js'

/**
 * Returns the number of transactions at a block number, hash, or tag.
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
 * const count = await Actions.block.getTransactionCount(client)
 * ```
 */
export async function getTransactionCount(
  client: Client.Client,
  options: getTransactionCount.Options = {},
): Promise<getTransactionCount.ReturnType> {
  const {
    blockHash,
    blockNumber,
    blockTag = client.blockTag ?? 'latest',
  } = options

  const count = await (() => {
    if (blockHash)
      return client.request(
        {
          method: 'eth_getBlockTransactionCountByHash',
          params: [blockHash],
        },
        { dedupe: true },
      )
    return client.request(
      {
        method: 'eth_getBlockTransactionCountByNumber',
        params: [
          typeof blockNumber === 'bigint' ? Hex.fromNumber(blockNumber) : blockTag,
        ],
      },
      { dedupe: typeof blockNumber === 'bigint' },
    )
  })()

  return Hex.toNumber(count)
}

export declare namespace getTransactionCount {
  type Options =
    | {
        /** Hash of the block. */
        blockHash?: Block.Hash | undefined
        blockNumber?: undefined
        blockTag?: undefined
      }
    | {
        blockHash?: undefined
        /** The block number. */
        blockNumber?: bigint | undefined
        blockTag?: undefined
      }
    | {
        blockHash?: undefined
        blockNumber?: undefined
        /** The block tag. @default 'latest' */
        blockTag?: Block.Tag | undefined
      }

  type ReturnType = number

  type ErrorType = Errors.GlobalErrorType
}
