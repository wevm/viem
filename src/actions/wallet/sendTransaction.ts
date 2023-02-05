import type { WalletClient } from '../../clients'
import { InvalidGasArgumentsError } from '../../errors'
import type {
  Chain,
  Formatter,
  Hash,
  MergeIntersectionProperties,
  TransactionRequest,
} from '../../types'
import type { Formatted, TransactionRequestFormatter } from '../../utils'
import { extract, format, formatTransactionRequest } from '../../utils'

export type FormattedTransactionRequest<
  TFormatter extends Formatter | undefined = Formatter,
> = MergeIntersectionProperties<
  Formatted<TFormatter, TransactionRequest, true>,
  TransactionRequest
>

export type SendTransactionArgs<TChain extends Chain = Chain> =
  FormattedTransactionRequest<TransactionRequestFormatter<TChain>> & {
    chain?: TChain
  }

export type SendTransactionResponse = Hash

export async function sendTransaction<TChain extends Chain>(
  client: WalletClient,
  {
    chain,
    from,
    accessList,
    data,
    gas,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    to,
    value,
    ...rest
  }: SendTransactionArgs<TChain>,
): Promise<SendTransactionResponse> {
  if (
    maxFeePerGas !== undefined &&
    maxPriorityFeePerGas !== undefined &&
    maxFeePerGas < maxPriorityFeePerGas
  )
    throw new InvalidGasArgumentsError()

  const formatter = chain?.formatters?.transactionRequest
  const request_ = format(
    {
      from,
      accessList,
      data,
      gas,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      to,
      value,
      // Pick out extra data that might exist on the chain's transaction request type.
      ...extract(rest, { formatter }),
    } as TransactionRequest,
    {
      formatter: formatter || formatTransactionRequest,
    },
  )

  const hash = await client.request({
    method: 'eth_sendTransaction',
    params: [request_],
  })
  return hash
}
