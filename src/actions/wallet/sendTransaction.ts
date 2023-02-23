import type { WalletClient } from '../../clients'
import { BaseError, ChainMismatchError } from '../../errors'
import type {
  Chain,
  Formatter,
  Hash,
  MergeIntersectionProperties,
  TransactionRequest,
} from '../../types'
import {
  Formatted,
  TransactionRequestFormatter,
  assertRequest,
  extract,
  format,
  formatTransactionRequest,
  getTransactionError,
} from '../../utils'
import { getChainId } from '../public'

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
  args: SendTransactionArgs<TChain>,
): Promise<SendTransactionResponse> {
  const {
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
  } = args
  try {
    assertRequest(args)

    const currentChainId = await getChainId(client)
    if (chain && currentChainId !== chain?.id)
      throw new ChainMismatchError({ chain, currentChainId })

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
  } catch (err) {
    throw getTransactionError(err as BaseError, args)
  }
}
