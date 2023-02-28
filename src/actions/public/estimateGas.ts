import type { PublicClient, WalletClient } from '../../clients'
import { BaseError } from '../../errors'
import type {
  BlockTag,
  Chain,
  Formatter,
  MergeIntersectionProperties,
  TransactionRequest,
} from '../../types'
import { Account } from '../../types/account'
import {
  assertRequest,
  extract,
  format,
  Formatted,
  formatTransactionRequest,
  getEstimateGasError,
  numberToHex,
  prepareRequest,
  TransactionRequestFormatter,
} from '../../utils'

export type FormattedEstimateGas<
  TFormatter extends Formatter | undefined = Formatter,
> = MergeIntersectionProperties<
  Omit<Formatted<TFormatter, TransactionRequest, true>, 'from'>,
  TransactionRequest
>

export type EstimateGasArgs<TChain extends Chain = Chain> =
  FormattedEstimateGas<TransactionRequestFormatter<TChain>> & {
    account: Account
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

export type EstimateGasResponse = bigint

/**
 * @description Estimates the gas necessary to complete a transaction without submitting it to the network.
 */
export async function estimateGas<TChain extends Chain>(
  client: PublicClient<any, TChain> | WalletClient,
  args: EstimateGasArgs<TChain>,
): Promise<EstimateGasResponse> {
  try {
    const {
      account,
      accessList,
      blockNumber,
      blockTag = 'latest',
      data,
      gas,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      to,
      value,
      ...rest
    } = args.account.type === 'externally-owned'
      ? await prepareRequest(client, args)
      : args

    const blockNumberHex = blockNumber ? numberToHex(blockNumber) : undefined

    assertRequest(args)

    const formatter = client.chain?.formatters?.transactionRequest
    const request = format(
      {
        from: account.address,
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
      params: [request, blockNumberHex || blockTag],
    })
    return BigInt(balance)
  } catch (err) {
    throw getEstimateGasError(err as BaseError, {
      ...args,
      chain: client.chain,
    })
  }
}
