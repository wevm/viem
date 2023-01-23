import type { Chain, Formatter } from '../../chains'
import type { WalletClient } from '../../clients'
import type {
  Hash,
  MergeIntersectionProperties,
  TransactionRequest,
} from '../../types'
import type { Formatted, TransactionRequestFormatter } from '../../utils'
import { BaseError, format, formatTransactionRequest } from '../../utils'

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

  // TODO: validate `chain`

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
      ...rest,
    } as TransactionRequest,
    {
      formatter:
        chain?.formatters?.transactionRequest || formatTransactionRequest,
    },
  )

  const hash = await client.request({
    method: 'eth_sendTransaction',
    params: [request_],
  })
  return hash
}

export class InvalidGasArgumentsError extends BaseError {
  name = 'InvalidGasArgumentsError'
  constructor() {
    super('`maxFeePerGas` cannot be less than `maxPriorityFeePerGas`')
  }
}
