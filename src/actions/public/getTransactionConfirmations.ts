import type { PublicClient } from '../../clients/index.js'
import type { Chain, Hash } from '../../types/index.js'
import type {
  FormattedTransactionReceipt,
  TransactionReceiptFormatter,
} from '../../utils/index.js'
import { getBlockNumber } from './getBlockNumber.js'
import { getTransaction } from './getTransaction.js'

export type GetTransactionConfirmationsParameters<
  TChain extends Chain = Chain,
> =
  | {
      /** The transaction hash. */
      hash: Hash
      transactionReceipt?: never
    }
  | {
      hash?: never
      /** The transaction receipt. */
      transactionReceipt: FormattedTransactionReceipt<
        TransactionReceiptFormatter<TChain>
      >
    }

export type GetTransactionConfirmationsReturnType = bigint

export async function getTransactionConfirmations<TChain extends Chain>(
  client: PublicClient<any, TChain>,
  { hash, transactionReceipt }: GetTransactionConfirmationsParameters<TChain>,
): Promise<GetTransactionConfirmationsReturnType> {
  const [blockNumber, transaction] = await Promise.all([
    getBlockNumber(client),
    hash ? getTransaction(client, { hash }) : undefined,
  ])
  const transactionBlockNumber =
    transactionReceipt?.blockNumber || transaction?.blockNumber
  if (!transactionBlockNumber) return 0n
  return blockNumber - transactionBlockNumber! + 1n
}
