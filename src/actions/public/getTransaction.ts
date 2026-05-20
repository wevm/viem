import * as Address from 'ox/Address'
import * as Hex from 'ox/Hex'
import * as Transaction from 'ox/Transaction'

import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import { BaseError } from '../../core/BaseError.js'
import type * as Block from '../../utils/Block.js'

/**
 * Returns information about a transaction given a hash or block identifier.
 *
 * @example
 * ```ts twoslash
 * import { actions, Client, http } from 'viem'
 *
 * const client = Client.create({
 *   transport: http('https://1.rpc.thirdweb.com'),
 * })
 *
 * const transaction = await actions.getTransaction(client, {
 *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
 * })
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 * @returns Transaction.
 */
export async function getTransaction<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: getTransaction.Options,
): getTransaction.ReturnType {
  const { blockHash, blockNumber, hash, index, sender, nonce } = options
  const blockTag = options.blockTag ?? 'latest'
  const blockNumberHex =
    blockNumber !== undefined ? Hex.fromNumber(blockNumber) : undefined

  const request = client.request as (
    request: { method: string; params: unknown[] },
    options?: { dedupe?: boolean },
  ) => Promise<Transaction.Rpc | null>

  const transaction = await (async (): Promise<Transaction.Rpc | null> => {
    if (hash)
      return request(
        { method: 'eth_getTransactionByHash', params: [hash] },
        { dedupe: true },
      )
    if (blockHash && index !== undefined)
      return request(
        {
          method: 'eth_getTransactionByBlockHashAndIndex',
          params: [blockHash, Hex.fromNumber(index)],
        },
        { dedupe: true },
      )
    if (index !== undefined)
      return request(
        {
          method: 'eth_getTransactionByBlockNumberAndIndex',
          params: [blockNumberHex ?? blockTag, Hex.fromNumber(index)],
        },
        { dedupe: Boolean(blockNumberHex) },
      )
    return request(
      {
        method: 'eth_getTransactionBySenderAndNonce',
        params: [sender!, Hex.fromNumber(nonce!)],
      },
      { dedupe: true },
    )
  })()

  if (!transaction)
    throw new TransactionNotFoundError({
      blockHash,
      blockNumber,
      blockTag,
      hash,
      index,
    })

  return Transaction.fromRpc(transaction)!
}

export declare namespace getTransaction {
  type Options =
    | {
        /** Block hash. */
        blockHash: Hex.Hex
        /** Transaction index in the block. */
        index: number
        blockNumber?: undefined
        blockTag?: undefined
        hash?: undefined
        sender?: undefined
        nonce?: undefined
      }
    | {
        /** Block number. */
        blockNumber: bigint
        /** Transaction index in the block. */
        index: number
        blockHash?: undefined
        blockTag?: undefined
        hash?: undefined
        sender?: undefined
        nonce?: undefined
      }
    | {
        /** Block tag. */
        blockTag: Block.Tag
        /** Transaction index in the block. */
        index: number
        blockHash?: undefined
        blockNumber?: undefined
        hash?: undefined
        sender?: undefined
        nonce?: undefined
      }
    | {
        /** Transaction hash. */
        hash: Hex.Hex
        blockHash?: undefined
        blockNumber?: undefined
        blockTag?: undefined
        index?: undefined
        sender?: undefined
        nonce?: undefined
      }
    | {
        /** Transaction sender. */
        sender: Address.Address
        /** Transaction nonce on the sender. */
        nonce: number
        blockHash?: undefined
        blockNumber?: undefined
        blockTag?: undefined
        index?: undefined
        hash?: undefined
      }

  type ReturnType = Promise<Transaction.Transaction>

  type ErrorType = Hex.fromNumber.ErrorType | TransactionNotFoundError
}

export class TransactionNotFoundError extends BaseError {
  override name = 'actions.public.TransactionNotFoundError'

  constructor(options: TransactionNotFoundError.Options = {}) {
    const { blockHash, blockNumber, blockTag, hash, index } = options
    let identifier = 'Transaction'
    if (blockTag && index !== undefined)
      identifier = `Transaction at block time "${blockTag}" at index "${index}"`
    if (blockHash && index !== undefined)
      identifier = `Transaction at block hash "${blockHash}" at index "${index}"`
    if (blockNumber !== undefined && index !== undefined)
      identifier = `Transaction at block number "${blockNumber}" at index "${index}"`
    if (hash) identifier = `Transaction with hash "${hash}"`
    super(`${identifier} could not be found.`)
  }
}

export declare namespace TransactionNotFoundError {
  type Options = {
    blockHash?: Hex.Hex | undefined
    blockNumber?: bigint | undefined
    blockTag?: Block.Tag | undefined
    hash?: Hex.Hex | undefined
    index?: number | undefined
  }
}
