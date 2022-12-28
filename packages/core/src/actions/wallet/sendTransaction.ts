import type { Chain, Formatter } from '../../chains'
import type { WalletClient } from '../../clients'
import type {
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

export type SendTransactionArgs<TChain extends Chain = Chain> = {
  chain?: TChain
  request: FormattedTransactionRequest<TransactionRequestFormatter<TChain>>
}

export type SendTransactionResponse = { hash: `0x${string}` }

export async function sendTransaction<TChain extends Chain>(
  client: WalletClient<any, TChain>,
  { chain, request }: SendTransactionArgs<TChain>,
): Promise<SendTransactionResponse> {
  if (
    request.maxFeePerGas !== undefined &&
    request.maxPriorityFeePerGas !== undefined &&
    request.maxFeePerGas < request.maxPriorityFeePerGas
  )
    throw new InvalidGasArgumentsError()

  // TODO: validate `chain`

  const request_ = format(request as TransactionRequest, {
    formatter:
      chain?.formatters?.transactionRequest || formatTransactionRequest,
  })

  const hash = await client.request({
    method: 'eth_sendTransaction',
    params: [request_],
  })
  return { hash }
}

export class InvalidGasArgumentsError extends BaseError {
  name = 'InvalidGasArgumentsError'

  constructor() {
    super({
      humanMessage: 'Gas values provided are invalid.',
      details: 'maxFeePerGas cannot be less than maxPriorityFeePerGas',
    })
  }
}
