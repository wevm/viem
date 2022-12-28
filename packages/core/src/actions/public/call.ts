import type { Chain, Formatter } from '../../chains'
import type { PublicClient } from '../../clients'
import type {
  BlockTag,
  Data,
  MergeIntersectionProperties,
  TransactionRequest,
} from '../../types'
import type { Formatted, TransactionRequestFormatter } from '../../utils'
import { format, formatTransactionRequest, numberToHex } from '../../utils'
import { InvalidGasArgumentsError } from '../wallet'

export type FormattedCall<
  TFormatter extends Formatter | undefined = Formatter,
> = MergeIntersectionProperties<
  Formatted<TFormatter, TransactionRequest, true>,
  TransactionRequest
>

export type CallArgs<TChain extends Chain = Chain> = {
  chain?: TChain
  request: FormattedCall<TransactionRequestFormatter<TChain>>
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

export type CallResponse = { data: Data | undefined }

export async function call<TChain extends Chain>(
  client: PublicClient,
  { blockNumber, blockTag = 'latest', chain, request }: CallArgs<TChain>,
): Promise<CallResponse> {
  if (
    request.maxFeePerGas !== undefined &&
    request.maxPriorityFeePerGas !== undefined &&
    request.maxFeePerGas < request.maxPriorityFeePerGas
  )
    throw new InvalidGasArgumentsError()

  const blockNumberHex = blockNumber ? numberToHex(blockNumber) : undefined

  const request_ = format(request as TransactionRequest, {
    formatter:
      chain?.formatters?.transactionRequest || formatTransactionRequest,
  })

  const data = await client.request({
    method: 'eth_call',
    params: [request_, blockNumberHex || blockTag],
  })
  if (data === '0x') return { data: undefined }
  return { data }
}
