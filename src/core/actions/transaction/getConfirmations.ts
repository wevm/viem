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
  return blockNumber - transactionBlockNumber + 1n
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
