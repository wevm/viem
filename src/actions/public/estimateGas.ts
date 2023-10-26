import type { Account } from '../../accounts/types.js'
import {
  type ParseAccountErrorType,
  parseAccount,
} from '../../accounts/utils/parseAccount.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../errors/account.js'
import type { BaseError } from '../../errors/base.js'
import type { GetAccountParameter } from '../../types/account.js'
import type { BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type { TransactionRequest } from '../../types/transaction.js'
import type { UnionOmit } from '../../types/utils.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import {
  type NumberToHexErrorType,
  numberToHex,
} from '../../utils/encoding/toHex.js'
import {
  type GetEstimateGasErrorReturnType,
  getEstimateGasError,
} from '../../utils/errors/getEstimateGasError.js'
import { extract } from '../../utils/formatters/extract.js'
import {
  type FormattedTransactionRequest,
  formatTransactionRequest,
} from '../../utils/formatters/transactionRequest.js'
import {
  type AssertRequestErrorType,
  type AssertRequestParameters,
  assertRequest,
} from '../../utils/transaction/assertRequest.js'
import {
  type PrepareTransactionRequestParameters,
  prepareTransactionRequest,
} from '../wallet/prepareTransactionRequest.js'

export type FormattedEstimateGas<
  TChain extends Chain | undefined = Chain | undefined,
> = FormattedTransactionRequest<TChain>

export type EstimateGasParameters<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = undefined,
> = UnionOmit<FormattedEstimateGas<TChain>, 'from'> &
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

export type EstimateGasErrorType = GetEstimateGasErrorReturnType<
  | ParseAccountErrorType
  | NumberToHexErrorType
  | RequestErrorType
  | AssertRequestErrorType
>

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
  client: Client<Transport, TChain, TAccount>,
  args: EstimateGasParameters<TChain, TAccount>,
): Promise<EstimateGasReturnType> {
  const account_ = args.account ?? client.account
  if (!account_)
    throw new AccountNotFoundError({
      docsPath: '/docs/actions/public/estimateGas',
    })
  const account = parseAccount(account_)

  try {
    const {
      accessList,
      blockNumber,
      blockTag,
      data,
      gas,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      to,
      value,
      ...rest
    } =
      account.type === 'local'
        ? ((await prepareTransactionRequest(
            client,
            args as PrepareTransactionRequestParameters,
          )) as EstimateGasParameters)
        : args

    const blockNumberHex = blockNumber ? numberToHex(blockNumber) : undefined
    const block = blockNumberHex || blockTag

    assertRequest(args as AssertRequestParameters)

    const chainFormat = client.chain?.formatters?.transactionRequest?.format
    const format = chainFormat || formatTransactionRequest

    const request = format({
      // Pick out extra data that might exist on the chain's transaction request type.
      ...extract(rest, { format: chainFormat }),
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
    } as TransactionRequest)

    const balance = await client.request({
      method: 'eth_estimateGas',
      params: block ? [request, block] : [request],
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
