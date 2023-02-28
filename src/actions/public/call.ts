import type { PublicClient } from '../../clients'
import { BaseError } from '../../errors'
import type {
  BlockTag,
  Chain,
  Formatter,
  Hex,
  MergeIntersectionProperties,
  TransactionRequest,
} from '../../types'
import { Account } from '../../types/account'
import {
  assertRequest,
  extract,
  Formatted,
  getCallError,
  TransactionRequestFormatter,
} from '../../utils'
import { format, formatTransactionRequest, numberToHex } from '../../utils'

export type FormattedCall<
  TFormatter extends Formatter | undefined = Formatter,
> = MergeIntersectionProperties<
  Omit<Formatted<TFormatter, TransactionRequest, true>, 'from'>,
  TransactionRequest
>

export type CallArgs<TChain extends Chain = Chain> = FormattedCall<
  TransactionRequestFormatter<TChain>
> & {
  account?: Account
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
  client: PublicClient<any, TChain>,
  args: CallArgs<TChain>,
): Promise<CallResponse> {
  const {
    account,
    blockNumber,
    blockTag = 'latest',
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

    const blockNumberHex = blockNumber ? numberToHex(blockNumber) : undefined
    const formatter = client.chain?.formatters?.transactionRequest
    const request_ = format(
      {
        from: account?.address,
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

    const response = await client.request({
      method: 'eth_call',
      params: [request_, blockNumberHex || blockTag],
    })
    if (response === '0x') return { data: undefined }
    return { data: response }
  } catch (err) {
    throw getCallError(err as BaseError, {
      ...args,
      chain: client.chain,
    })
  }
}
