import type * as Hex from 'ox/Hex'
import type * as TransactionReceipt from 'ox/TransactionReceipt'

import type * as Chain from '../../core/Chain.js'
import type * as Client from '../../core/Client.js'
import { getBlockNumber } from './getBlockNumber.js'
import { getTransaction } from './getTransaction.js'

/**
 * Returns the number of blocks elapsed since a transaction was mined.
 *
 * @example
 * ```ts twoslash
 * import { actions, Client, http } from 'viem'
 *
 * const client = Client.create({
 *   transport: http('https://1.rpc.thirdweb.com'),
 * })
 *
 * const confirmations = await actions.getTransactionConfirmations(client, {
 *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
 * })
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 * @returns Number of confirmations. `0n` if the transaction has not been mined.
 */
export async function getTransactionConfirmations<
  chain extends Chain.Chain | undefined = Chain.Chain | undefined,
>(
  client: Client.Client<chain>,
  options: getTransactionConfirmations.Options,
): getTransactionConfirmations.ReturnType {
  const { hash, transactionReceipt } = options
  const [blockNumber, transaction] = await Promise.all([
    getBlockNumber(client),
    hash ? getTransaction(client, { hash }) : undefined,
  ])
  const transactionBlockNumber =
    transactionReceipt?.blockNumber ?? transaction?.blockNumber
  if (transactionBlockNumber === null || transactionBlockNumber === undefined)
    return 0n
  return blockNumber - transactionBlockNumber + 1n
}

export declare namespace getTransactionConfirmations {
  type Options =
    | {
        /** Transaction hash. */
        hash: Hex.Hex
        transactionReceipt?: undefined
      }
    | {
        hash?: undefined
        /** Transaction receipt. */
        transactionReceipt: TransactionReceipt.TransactionReceipt
      }

  type ReturnType = Promise<bigint>

  type ErrorType = getBlockNumber.ErrorType | getTransaction.ErrorType
}
