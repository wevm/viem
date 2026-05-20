import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import { BaseError } from '../../core/BaseError.js'
import * as Block from '../../utils/Block.js'
import * as Hex from '../../utils/Hex.js'

/**
 * Returns information about a block at a block number, hash, or tag.
 *
 * @example
 * ```ts twoslash
 * import { actions, Client, http } from 'viem'
 *
 * const client = Client.create({
 *   transport: http('https://1.rpc.thirdweb.com'),
 * })
 *
 * const block = await actions.getBlock(client)
 * // @log: { number: 69420n, ... }
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 * @returns Block.
 */
export async function getBlock<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
  includeTransactions extends boolean = false,
  blockTag extends Block.Tag = 'latest',
>(
  client: Client.Client<chain>,
  options: getBlock.Options<includeTransactions, blockTag> = {},
): getBlock.ReturnType<includeTransactions, blockTag> {
  const {
    blockHash,
    blockNumber,
    blockTag = client.blockTag ?? 'latest',
    includeTransactions = false,
  } = options

  const block = blockHash
    ? await client.request(
        {
          method: 'eth_getBlockByHash',
          params: [blockHash, includeTransactions],
        },
        { dedupe: true },
      )
    : await client.request(
        {
          method: 'eth_getBlockByNumber',
          params: [
            blockNumber !== undefined ? Hex.fromNumber(blockNumber) : blockTag,
            includeTransactions,
          ],
        },
        { dedupe: blockNumber !== undefined },
      )

  if (!block) throw new BlockNotFoundError({ blockHash, blockNumber })
  return Block.fromRpc<typeof block, includeTransactions, blockTag>(block, {
    blockTag,
    includeTransactions,
  })
}

export declare namespace getBlock {
  type Options<
    includeTransactions extends boolean = false,
    blockTag extends Block.Tag = 'latest',
  > = {
    /** Whether to include full transaction data. */
    includeTransactions?: includeTransactions | boolean | undefined
  } & (
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
        blockTag?: blockTag | Block.Tag | undefined
      }
  )

  type ReturnType<
    includeTransactions extends boolean = false,
    blockTag extends Block.Tag = 'latest',
  > = Promise<Block.Block<includeTransactions, blockTag>>

  type ErrorType = Hex.fromNumber.ErrorType | BlockNotFoundError
}

export class BlockNotFoundError extends BaseError {
  override name = 'actions.public.BlockNotFoundError'

  constructor(options: BlockNotFoundError.Options = {}) {
    const { blockHash, blockNumber } = options
    super('Block not found.', {
      metaMessages: [
        blockHash ? `Block hash: ${blockHash}` : undefined,
        blockNumber !== undefined ? `Block number: ${blockNumber}` : undefined,
      ].filter(Boolean),
    })
  }
}

export declare namespace BlockNotFoundError {
  type Options = {
    blockHash?: Hex.Hex | undefined
    blockNumber?: bigint | undefined
  }
}
