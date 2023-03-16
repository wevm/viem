import type { PublicClient } from '../../clients'
import type { Chain, Hash } from '../../types'
import type {
  FormattedTransactionReceipt,
  TransactionReceiptFormatter,
} from '../../utils'
import { getBlockNumber } from './getBlockNumber'
import { getTransaction } from './getTransaction'

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
      transactionReceipt: FormattedTransactionReceipt<
        TransactionReceiptFormatter<TChain>
      >
    }

export type GetTransactionConfirmationsReturnType = bigint

export async function getTransactionConfirmations<
  TChain extends Chain | undefined,
>(
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
