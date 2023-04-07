import type {
  PublicClient,
  WalletClient,
  Transport,
} from '../../clients/index.js'
import type { BaseError } from '../../errors/index.js'
import { AccountNotFoundError } from '../../errors/index.js'
import type {
  Account,
  BlockTag,
  Chain,
  Formatter,
  MergeIntersectionProperties,
  TransactionRequest,
} from '../../types/index.js'
import type { GetAccountParameter } from '../../types/account.js'
import {
  assertRequest,
  extract,
  format,
  formatTransactionRequest,
  getEstimateGasError,
  numberToHex,
  parseAccount,
  prepareRequest,
} from '../../utils/index.js'
import type {
  Formatted,
  TransactionRequestFormatter,
} from '../../utils/index.js'

export type FormattedEstimateGas<
  TFormatter extends Formatter | undefined = Formatter,
> = MergeIntersectionProperties<
  Omit<Formatted<TFormatter, TransactionRequest, true>, 'from'>,
  TransactionRequest
>

export type EstimateGasParameters<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = undefined,
> = FormattedEstimateGas<TransactionRequestFormatter<TChain>> &
  GetAccountParameter<TAccount> &
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

export type EstimateGasReturnType = bigint

/**
 * @description Estimates the gas necessary to complete a transaction without submitting it to the network.
 */
export async function estimateGas<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined = undefined,
>(
  client:
    | PublicClient<Transport, TChain>
    | WalletClient<Transport, TChain, TAccount>,
  args: EstimateGasParameters<TChain, TAccount>,
): Promise<EstimateGasReturnType> {
  if (!args.account)
    throw new AccountNotFoundError({
      docsPath: '/docs/actions/public/estimateGas',
    })
  const account = parseAccount(args.account)

  try {
    const {
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
    } = account.type === 'local' ? await prepareRequest(client, args) : args

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
      account,
      chain: client.chain,
    })
  }
}
