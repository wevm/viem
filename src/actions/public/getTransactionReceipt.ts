import type { PublicClient, Transport } from '../../clients'
import { TransactionReceiptNotFoundError } from '../../errors'
import type { Chain, Hash } from '../../types'
import { format } from '../../utils'
import type {
  FormattedTransactionReceipt,
  TransactionReceiptFormatter,
} from '../../utils/formatters/transactionReceipt'
import { formatTransactionReceipt } from '../../utils/formatters/transactionReceipt'

export type GetTransactionReceiptParameters = {
  /** The hash of the transaction. */
  hash: Hash
}

export type GetTransactionReceiptReturnType<
  TChain extends Chain | undefined = Chain | undefined,
> = FormattedTransactionReceipt<TransactionReceiptFormatter<TChain>>

export async function getTransactionReceipt<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
  { hash }: GetTransactionReceiptParameters,
) {
  const receipt = await client.request({
    method: 'eth_getTransactionReceipt',
    params: [hash],
  })

  if (!receipt) throw new TransactionReceiptNotFoundError({ hash })

  return format(receipt, {
    formatter:
      client.chain?.formatters?.transactionReceipt || formatTransactionReceipt,
  }) as GetTransactionReceiptReturnType<TChain>
}
