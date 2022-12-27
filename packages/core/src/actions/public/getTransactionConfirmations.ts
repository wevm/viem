import type { Chain } from '../../chains'
import type { PublicClient } from '../../clients'
import type { Data } from '../../types'
import type {
  FormattedTransactionReceipt,
  TransactionReceiptFormatter,
} from '../../utils'
import { getBlockNumber } from './getBlockNumber'
import { getTransaction } from './getTransaction'

export type GetTransactionConfirmationsArgs<TChain extends Chain> =
  | {
      /** The transaction hash. */
      hash: Data
      transactionReceipt?: never
    }
  | {
      hash?: never
      /** The transaction receipt. */
      transactionReceipt: FormattedTransactionReceipt<
        TransactionReceiptFormatter<TChain>
      >
    }

export type GetTransactionConfirmationsResponse = bigint

export async function getTransactionConfirmations<TChain extends Chain>(
  client: PublicClient<any, TChain>,
  { hash, transactionReceipt }: GetTransactionConfirmationsArgs<TChain>,
): Promise<GetTransactionConfirmationsResponse> {
  const [blockNumber, transaction] = await Promise.all([
    getBlockNumber(client),
    hash ? getTransaction(client, { hash }) : undefined,
  ])
  const transactionBlockNumber =
    transactionReceipt?.blockNumber || transaction?.blockNumber
  if (!transactionBlockNumber) return 0n
  return blockNumber - transactionBlockNumber! + 1n
}
