import * as Block from 'ox/Block'
import type * as Errors from 'ox/Errors'
import { z } from 'ox/zod'

import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import { BaseError } from '../../Errors.js'

/**
 * Returns information about a block at a block number, hash, or tag.
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
 * const block = await Actions.getBlock(client)
 * ```
 */
export async function getBlock<
  chain extends Chain.Chain | undefined,
  includeTransactions extends boolean = false,
  blockTag extends Block.Tag = 'latest',
>(
  client: Client.Client<chain>,
  options: getBlock.Options<includeTransactions, blockTag> = {},
): Promise<getBlock.ReturnType<chain, includeTransactions, blockTag>> {
  const {
    blockHash,
    blockNumber,
    blockTag = client.blockTag ?? 'latest',
    includeTransactions = false,
  } = options

  const block = await (() => {
    if (blockHash)
      return client.request(
        {
          method: 'eth_getBlockByHash',
          params: [blockHash, includeTransactions],
        },
        { dedupe: true },
      )
    const schema = z.RpcSchema.parseItem(
      z.RpcSchema.Eth,
      'eth_getBlockByNumber',
    )
    return client.request(
      {
        method: 'eth_getBlockByNumber',
        params: z.RpcSchema.encodeParams(schema, [
          typeof blockNumber === 'bigint' ? blockNumber : blockTag,
          includeTransactions,
        ]),
      },
      { dedupe: typeof blockNumber === 'bigint' },
    )
  })()

  if (!block) throw new BlockNotFoundError({ blockHash, blockNumber })

  const schema = client.chain?.schema?.block?.fromRpc
  return (
    schema
      ? z.decode(schema, block)
      : Block.fromRpc(block, { includeTransactions })
  ) as getBlock.ReturnType<chain, includeTransactions, blockTag>
}

export declare namespace getBlock {
  type Options<
    includeTransactions extends boolean = false,
    blockTag extends Block.Tag = 'latest',
  > = {
    /** Whether to include transaction data in the response. @default false */
    includeTransactions?: includeTransactions | undefined
  } & (
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
        blockTag?: blockTag | Block.Tag | undefined
      }
  )

  type ReturnType<
    chain extends Chain.Chain | undefined = undefined,
    includeTransactions extends boolean = false,
    blockTag extends Block.Tag = 'latest',
  > = Chain.ExtractBlock<chain, includeTransactions, blockTag>

  type ErrorType = BlockNotFoundError | Errors.GlobalErrorType
}

/** Thrown when a block could not be found. */
export class BlockNotFoundError extends BaseError {
  override readonly name = 'Block.NotFoundError'

  constructor({
    blockHash,
    blockNumber,
  }: {
    blockHash?: Block.Hash | undefined
    blockNumber?: bigint | undefined
  }) {
    let identifier = 'Block'
    if (blockHash) identifier = `Block at hash "${blockHash}"`
    if (blockNumber) identifier = `Block at number "${blockNumber}"`
    super(`${identifier} could not be found.`)
  }
}
