import type { Errors, Hex } from 'ox'

import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import { getNumber } from '../block/getNumber.js'
import { get } from './get.js'

/**
 * Returns the number of blocks passed (confirmations) since the transaction was
 * processed on a block.
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
 * const confirmations = await Actions.transaction.getConfirmations(client, {
 *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
 * })
 * ```
 */
export async function getConfirmations<chain extends Chain.Chain | undefined>(
  client: Client.Client<chain>,
  options: getConfirmations.Options<chain>,
): Promise<getConfirmations.ReturnType> {
  const { hash, transactionReceipt } = options

  const [blockNumber, transaction] = await Promise.all([
    getNumber(client),
    hash ? get(client, { hash }) : undefined,
  ])

  const transactionBlockNumber =
    transactionReceipt?.blockNumber || transaction?.blockNumber
  if (!transactionBlockNumber) return 0n
  // The block number can be out of date: it may come from the cache, or from
  // a request sent before the transaction's block existed.
  const headBlockNumber =
    blockNumber < transactionBlockNumber
      ? await getNumber(client, { cacheTime: 0 })
      : blockNumber
  // A transaction in a block has at least one confirmation, even when the
  // node that gave the block number is behind the node that gave the
  // transaction.
  if (headBlockNumber < transactionBlockNumber) return 1n
  return headBlockNumber - transactionBlockNumber + 1n
}

export declare namespace getConfirmations {
  type Options<chain extends Chain.Chain | undefined = undefined> =
    | {
        /** Hash of the transaction. */
        hash: Hex.Hex
        transactionReceipt?: undefined
      }
    | {
        hash?: undefined
        /** The transaction receipt. */
        transactionReceipt: Chain.ExtractTransactionReceipt<chain>
      }

  type ReturnType = bigint

  type ErrorType = getNumber.ErrorType | get.ErrorType | Errors.GlobalErrorType
}
