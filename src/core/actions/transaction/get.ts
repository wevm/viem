import type * as Address from 'ox/Address'
import type * as Block from 'ox/Block'
import type * as Errors from 'ox/Errors'
import * as Hex from 'ox/Hex'
import * as Transaction from 'ox/Transaction'
import { z } from 'ox/zod'

import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import { BaseError } from '../../Errors.js'
import type { OneOf } from '../../internal/types.js'

/**
 * Returns information about a transaction given a hash or block identifier.
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
 * const transaction = await Actions.transaction.get(client, {
 *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
 * })
 * ```
 */
export async function get<
  chain extends Chain.Chain | undefined,
  blockTag extends Block.Tag = 'latest',
>(
  client: Client.Client<chain>,
  options: get.Options<blockTag>,
): Promise<get.ReturnType<chain, blockTag>> {
  const {
    blockHash,
    blockNumber,
    blockTag = 'latest',
    hash,
    index,
    sender,
    nonce,
  } = options as get.Options & { index?: number; nonce?: number }

  const transaction = (await (() => {
    if (hash)
      return client.request(
        { method: 'eth_getTransactionByHash', params: [hash] },
        { dedupe: true },
      )
    if (blockHash)
      return client.request(
        {
          method: 'eth_getTransactionByBlockHashAndIndex',
          params: [blockHash, Hex.fromNumber(index!)],
        },
        { dedupe: true },
      )
    if (sender && typeof nonce === 'number')
      return client.request(
        {
          method: 'eth_getTransactionBySenderAndNonce',
          params: [sender, Hex.fromNumber(nonce)],
        },
        { dedupe: true },
      )
    const schema = z.RpcSchema.parseItem(
      z.RpcSchema.Eth,
      'eth_getTransactionByBlockNumberAndIndex',
    )
    return client.request(
      {
        method: 'eth_getTransactionByBlockNumberAndIndex',
        params: z.RpcSchema.encodeParams(schema, [
          typeof blockNumber === 'bigint' ? blockNumber : blockTag,
          Hex.fromNumber(index!),
        ]),
      },
      { dedupe: typeof blockNumber === 'bigint' },
    )
  })()) as Transaction.Rpc | null

  if (!transaction)
    throw new TransactionNotFoundError({
      blockHash,
      blockNumber,
      blockTag,
      hash,
      index,
    })

  const schema = client.chain?.schema?.transaction?.fromRpc
  return (
    schema ? z.decode(schema, transaction) : Transaction.fromRpc(transaction)
  ) as get.ReturnType<chain, blockTag>
}

export declare namespace get {
  type Options<blockTag extends Block.Tag = 'latest'> = OneOf<
    | {
        /** Hash of the block containing the transaction. */
        blockHash: Block.Hash
        /** Index of the transaction in the block. */
        index: number
      }
    | {
        /** Number of the block containing the transaction. */
        blockNumber: bigint
        /** Index of the transaction in the block. */
        index: number
      }
    | {
        /** Tag of the block containing the transaction. @default 'latest' */
        blockTag: blockTag | Block.Tag
        /** Index of the transaction in the block. */
        index: number
      }
    | {
        /** Hash of the transaction. */
        hash: Hex.Hex
      }
    | {
        /** Address that sent the transaction. */
        sender: Address.Address
        /** Nonce of the transaction on the sender. */
        nonce: number
      }
  >

  type ReturnType<
    chain extends Chain.Chain | undefined = undefined,
    blockTag extends Block.Tag = 'latest',
  > = Chain.ExtractTransaction<chain, blockTag extends 'pending' ? true : false>

  type ErrorType = TransactionNotFoundError | Errors.GlobalErrorType
}

/** Thrown when a transaction could not be found. */
export class TransactionNotFoundError extends BaseError {
  override readonly name = 'Transaction.NotFoundError'

  constructor({
    blockHash,
    blockNumber,
    blockTag,
    hash,
    index,
  }: {
    blockHash?: Block.Hash | undefined
    blockNumber?: bigint | undefined
    blockTag?: Block.Tag | undefined
    hash?: Hex.Hex | undefined
    index?: number | undefined
  }) {
    let identifier = 'Transaction'
    if (blockTag && index !== undefined)
      identifier = `Transaction at block time "${blockTag}" at index "${index}"`
    if (blockHash && index !== undefined)
      identifier = `Transaction at block hash "${blockHash}" at index "${index}"`
    if (blockNumber && index !== undefined)
      identifier = `Transaction at block number "${blockNumber}" at index "${index}"`
    if (hash) identifier = `Transaction with hash "${hash}"`
    super(`${identifier} could not be found.`)
  }
}
