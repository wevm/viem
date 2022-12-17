import type { Chain } from '../../chains'
import type { PublicClient } from '../../clients'
import type { Data } from '../../types'
import { format } from '../../utils'
import type {
  FormattedTransactionReceipt,
  TransactionReceiptFormatter,
} from '../../utils/formatters/transactionReceipt'
import { formatTransactionReceipt } from '../../utils/formatters/transactionReceipt'
import { TransactionNotFoundError } from './fetchTransaction'

export type FetchTransactionReceiptArgs = {
  /** The hash of the transaction. */
  hash: Data
}

export type FetchTransactionReceiptResponse<TChain extends Chain = Chain> =
  FormattedTransactionReceipt<TransactionReceiptFormatter<TChain>>

export async function fetchTransactionReceipt<TChain extends Chain>(
  client: PublicClient<any, TChain>,
  { hash }: FetchTransactionReceiptArgs,
) {
  const receipt = await client.request({
    method: 'eth_getTransactionReceipt',
    params: [hash],
  })

  if (!receipt) throw new TransactionNotFoundError({ hash })

  return format(receipt, {
    formatter:
      client.chain?.formatters?.transactionReceipt || formatTransactionReceipt,
  }) as FetchTransactionReceiptResponse<TChain>
}
