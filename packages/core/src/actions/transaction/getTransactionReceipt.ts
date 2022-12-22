import type { Chain } from '../../chains'
import type { PublicClient } from '../../clients'
import type { Data } from '../../types'
import { BaseError, format } from '../../utils'
import type {
  FormattedTransactionReceipt,
  TransactionReceiptFormatter,
} from '../../utils/formatters/transactionReceipt'
import { formatTransactionReceipt } from '../../utils/formatters/transactionReceipt'

export type GetTransactionReceiptArgs = {
  /** The hash of the transaction. */
  hash: Data
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
export class TransactionReceiptNotFoundError extends BaseError {
  name = 'TransactionReceiptNotFoundError'
  constructor({ hash }: { hash: Data }) {
    super({
      humanMessage: `Transaction receipt with hash "${hash}" could not be found.`,
      details: 'transaction receipt not found',
    })
  }
}
