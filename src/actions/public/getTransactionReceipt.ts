import type { PublicClient } from '../../clients'
import { TransactionReceiptNotFoundError } from '../../errors'
import type { Chain, Hash } from '../../types'
import { format } from '../../utils'
import type {
  FormattedTransactionReceipt,
  TransactionReceiptFormatter,
} from '../../utils/formatters/transactionReceipt'
import { formatTransactionReceipt } from '../../utils/formatters/transactionReceipt'

export type GetTransactionReceiptArgs = {
  /** The hash of the transaction. */
  hash: Hash
}

export type GetTransactionReceiptResponse<TChain extends Chain = Chain> =
  FormattedTransactionReceipt<TransactionReceiptFormatter<TChain>>

export async function getTransactionReceipt<TChain extends Chain>(
  client: PublicClient<any, TChain>,
  { hash }: GetTransactionReceiptArgs,
) {
  const receipt = await client.request({
    method: 'eth_getTransactionReceipt',
    params: [hash],
  })

  if (!receipt) throw new TransactionReceiptNotFoundError({ hash })

  return format(receipt, {
    formatter:
      client.chain?.formatters?.transactionReceipt || formatTransactionReceipt,
  }) as GetTransactionReceiptResponse<TChain>
}
