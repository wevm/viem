import type * as Block from 'ox/Block'
import type * as Errors from 'ox/Errors'
import * as Hex from 'ox/Hex'
import * as TransactionReceipt from 'ox/TransactionReceipt'
import { z } from 'ox/zod'

import type * as Chain from '../../../Chain.js'
import type * as Client from '../../../Client.js'
import { BlockNotFoundError } from './get.js'

/**
 * Returns the transaction receipts of a block at a block number, hash, or tag.
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
 * const receipts = await Actions.block.getReceipts(client, {
 *   blockNumber: 69420n,
 * })
 * ```
 */
export async function getReceipts<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getReceipts.Options = {},
): Promise<getReceipts.ReturnType<chain>> {
  const {
    blockHash,
    blockNumber,
    blockTag = client.blockTag ?? 'latest',
  } = options

  const blockNumberHex =
    typeof blockNumber === 'bigint' ? Hex.fromNumber(blockNumber) : undefined

  const receipts = (await client.request(
    {
      method: 'eth_getBlockReceipts',
      params: [blockHash ?? blockNumberHex ?? blockTag],
    } as never,
    { dedupe: Boolean(blockHash ?? blockNumberHex) },
  )) as readonly TransactionReceipt.Rpc[] | null

  if (!receipts) throw new BlockNotFoundError({ blockHash, blockNumber })

  const schema = client.chain?.schema?.transactionReceipt?.fromRpc
  return receipts.map((receipt) =>
    schema ? z.decode(schema, receipt) : TransactionReceipt.fromRpc(receipt),
  ) as getReceipts.ReturnType<chain>
}

export declare namespace getReceipts {
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

  type ReturnType<chain extends Chain.Chain | undefined = undefined> =
    Chain.ExtractTransactionReceipt<chain>[]

  type ErrorType = BlockNotFoundError | Errors.GlobalErrorType
}
