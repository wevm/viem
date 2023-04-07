import type { PublicClient, Transport } from '../../clients/index.js'
import { TransactionReceiptNotFoundError } from '../../errors/index.js'
import type { Chain, Hash } from '../../types/index.js'
import { format } from '../../utils/index.js'
import type {
  FormattedTransactionReceipt,
  TransactionReceiptFormatter,
} from '../../utils/formatters/transactionReceipt.js'
import { formatTransactionReceipt } from '../../utils/formatters/transactionReceipt.js'

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
