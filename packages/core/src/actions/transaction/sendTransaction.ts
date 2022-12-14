import type { Chain, Formatter } from '../../chains'
import type { WalletClient } from '../../clients'
import type { TransactionRequest } from '../../types'
import type { Formatted, TransactionRequestFormatter } from '../../utils'
import { BaseError, formatTransactionRequest } from '../../utils'

export type FormattedTransactionRequest<
  TFormatter extends Formatter | undefined = Formatter,
> = Formatted<TransactionRequest, TransactionRequest, TFormatter, true>

export type SendTransactionArgs<TChain extends Chain = Chain> = {
  chain?: TChain
  request: FormattedTransactionRequest<TransactionRequestFormatter<TChain>>
}

export type SendTransactionResponse = { hash: `0x${string}` }

export async function sendTransaction<TChain extends Chain>(
  client: WalletClient,
  { chain, request }: SendTransactionArgs<TChain>,
): Promise<SendTransactionResponse> {
  if (
    request.maxFeePerGas !== undefined &&
    request.maxPriorityFeePerGas !== undefined &&
    request.maxFeePerGas < request.maxPriorityFeePerGas
  )
    throw new InvalidGasArgumentsError()

  // TODO: validate `chain`

  const hash = await client.request({
    method: 'eth_sendTransaction',
    params: [
      formatTransactionRequest(request, {
        formatter: chain?.formatters?.transactionRequest,
      }),
    ],
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
