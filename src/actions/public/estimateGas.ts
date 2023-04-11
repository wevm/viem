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
        /**
         * The balance of the account at a block tag.
         * @default 'latest'
         */
        blockTag?: BlockTag
      }
  )

export type EstimateGasReturnType = bigint

/**
 * Estimates the gas necessary to complete a transaction without submitting it to the network.
 *
 * - Docs: https://viem.sh/docs/actions/public/estimateGas.html
 * - JSON-RPC Methods: [`eth_estimateGas`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_estimategas)
 *
 * @param client - Client to use
 * @param parameters - {@link EstimateGasParameters}
 * @returns The gas estimate (in wei). {@link EstimateGasReturnType}
 *
 * @example
 * import { createPublicClient, http, parseEther } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { estimateGas } from 'viem/public'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const gasEstimate = await estimateGas(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: parseEther('1'),
 * })
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
