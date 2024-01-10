import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { ErrorType } from '../../errors/utils.js'
import type { Chain } from '../../types/chain.js'
import type { Hash } from '../../types/misc.js'
import type { FormattedTransactionReceipt } from '../../utils/formatters/transactionReceipt.js'
import { getAction } from '../../utils/getAction.js'

import {
  type GetBlockNumberErrorType,
  getBlockNumber,
} from './getBlockNumber.js'
import {
  type GetTransactionErrorType,
  getTransaction,
} from './getTransaction.js'

export type GetTransactionConfirmationsParameters<
  TChain extends Chain | undefined = Chain,
> =
  | {
      /** The transaction hash. */
      hash: Hash
      transactionReceipt?: never
    }
  | {
      hash?: never
      /** The transaction receipt. */
      transactionReceipt: FormattedTransactionReceipt<TChain>
    }

export type GetTransactionConfirmationsReturnType = bigint

export type GetTransactionConfirmationsErrorType =
  | GetBlockNumberErrorType
  | GetTransactionErrorType
  | ErrorType

/**
 * Returns the number of blocks passed (confirmations) since the transaction was processed on a block.
 *
 * - Docs: https://viem.sh/docs/actions/public/getTransactionConfirmations
 * - Example: https://stackblitz.com/github/wevm/viem/tree/main/examples/transactions/fetching-transactions
 * - JSON-RPC Methods: [`eth_getTransactionConfirmations`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getTransactionConfirmations)
 *
 * @param client - Client to use
 * @param parameters - {@link GetTransactionConfirmationsParameters}
 * @returns The number of blocks passed since the transaction was processed. If confirmations is 0, then the Transaction has not been confirmed & processed yet. {@link GetTransactionConfirmationsReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getTransactionConfirmations } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const confirmations = await getTransactionConfirmations(client, {
 *   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
 * })
 */
export async function getTransactionConfirmations<
  TChain extends Chain | undefined,
>(
  client: Client<Transport, TChain>,
  { hash, transactionReceipt }: GetTransactionConfirmationsParameters<TChain>,
): Promise<GetTransactionConfirmationsReturnType> {
  const [blockNumber, transaction] = await Promise.all([
    getAction(client, getBlockNumber, 'getBlockNumber')({}),
    hash
      ? getAction(client, getTransaction, 'getBlockNumber')({ hash })
      : undefined,
  ])
  const transactionBlockNumber =
    transactionReceipt?.blockNumber || transaction?.blockNumber
  if (!transactionBlockNumber) return 0n
  return blockNumber - transactionBlockNumber! + 1n
}
