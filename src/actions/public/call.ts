import type { Chain, Formatter } from '../../chains'
import type { PublicClient } from '../../clients'
import { InvalidGasArgumentsError } from '../../errors'
import type {
  Address,
  BlockTag,
  Hex,
  MergeIntersectionProperties,
  TransactionRequest,
} from '../../types'
import type { Formatted, TransactionRequestFormatter } from '../../utils'
import { format, formatTransactionRequest, numberToHex } from '../../utils'

export type FormattedCall<
  TFormatter extends Formatter | undefined = Formatter,
> = MergeIntersectionProperties<
  Formatted<TFormatter, TransactionRequest, true>,
  TransactionRequest
>

export type CallArgs<TChain extends Chain = Chain> = FormattedCall<
  TransactionRequestFormatter<TChain>
> & {
  chain?: TChain
  from?: Address
} & (
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

export type CallResponse = { data: Hex | undefined }

export async function call<TChain extends Chain>(
  client: PublicClient,
  {
    blockNumber,
    blockTag = 'latest',
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
  }: CallArgs<TChain>,
): Promise<CallResponse> {
  if (
    maxFeePerGas !== undefined &&
    maxPriorityFeePerGas !== undefined &&
    maxFeePerGas < maxPriorityFeePerGas
  )
    throw new InvalidGasArgumentsError()

  const blockNumberHex = blockNumber ? numberToHex(blockNumber) : undefined

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

  const response = await client.request({
    method: 'eth_call',
    params: [request_, blockNumberHex || blockTag],
  })
  if (response === '0x') return { data: undefined }
  return { data: response }
}
