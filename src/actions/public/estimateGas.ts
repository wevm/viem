import type { PublicClient } from '../../clients'
import type {
  BlockTag,
  Chain,
  Formatter,
  MergeIntersectionProperties,
  TransactionRequest,
} from '../../types'
import {
  extract,
  format,
  Formatted,
  formatTransactionRequest,
  numberToHex,
  TransactionRequestFormatter,
} from '../../utils'

export type FormattedEstimateGas<
  TFormatter extends Formatter | undefined = Formatter,
> = MergeIntersectionProperties<
  Formatted<TFormatter, TransactionRequest, true>,
  TransactionRequest
>

export type EstimateGasArgs<TChain extends Chain = Chain> =
  FormattedEstimateGas<TransactionRequestFormatter<TChain>> &
    (
      | {
          /** The balance of the account at a block number. */
          blockNumber?: bigint
          blockTag?: never
        }
      | {
          blockNumber?: never
          /** The balance of the account at a block tag. */
          blockTag?: BlockTag
        }
    )

export type EstimateGasResponse = bigint

/**
 * @description Estimates the gas necessary to complete a transaction without submitting it to the network.
 */
export async function estimateGas<TChain extends Chain>(
  client: PublicClient<any, TChain>,
  {
    accessList,
    blockNumber,
    blockTag = 'latest',
    data,
    from,
    gas,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    to,
    value,
    ...rest
  }: EstimateGasArgs,
): Promise<EstimateGasResponse> {
  const blockNumberHex = blockNumber ? numberToHex(blockNumber) : undefined

  const formatter = client.chain?.formatters?.transactionRequest
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

  const balance = await client.request({
    method: 'eth_estimateGas',
    params: [request_, blockNumberHex || blockTag],
  })
  return BigInt(balance)
}
