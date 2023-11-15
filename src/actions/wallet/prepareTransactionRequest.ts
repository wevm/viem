import type { Account } from '../../accounts/types.js'
import {
  type ParseAccountErrorType,
  parseAccount,
} from '../../accounts/utils/parseAccount.js'
import {
  type EstimateFeesPerGasErrorType,
  internal_estimateFeesPerGas,
} from '../../actions/public/estimateFeesPerGas.js'
import {
  type EstimateGasErrorType,
  type EstimateGasParameters,
  estimateGas,
} from '../../actions/public/estimateGas.js'
import {
  type GetBlockErrorType,
  getBlock,
} from '../../actions/public/getBlock.js'
import {
  type GetTransactionCountErrorType,
  getTransactionCount,
} from '../../actions/public/getTransactionCount.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import {
  AccountNotFoundError,
  type AccountNotFoundErrorType,
} from '../../errors/account.js'
import {
  Eip1559FeesNotSupportedError,
  MaxFeePerGasTooLowError,
} from '../../errors/fee.js'
import type { GetAccountParameter } from '../../types/account.js'
import type { Chain } from '../../types/chain.js'
import type { GetChain } from '../../types/chain.js'
import type { TransactionSerializable } from '../../types/transaction.js'
import type { UnionOmit } from '../../types/utils.js'
import type { FormattedTransactionRequest } from '../../utils/formatters/transactionRequest.js'
import { getAction } from '../../utils/getAction.js'
import type {
  AssertRequestErrorType,
  AssertRequestParameters,
} from '../../utils/transaction/assertRequest.js'
import { assertRequest } from '../../utils/transaction/assertRequest.js'
import { getTransactionType } from '../../utils/transaction/getTransactionType.js'

export type PrepareTransactionRequestParameters<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TChainOverride extends Chain | undefined = Chain | undefined,
> = UnionOmit<
  FormattedTransactionRequest<
    TChainOverride extends Chain ? TChainOverride : TChain
  >,
  'from'
> &
  GetAccountParameter<TAccount> &
  GetChain<TChain, TChainOverride>

export type PrepareTransactionRequestReturnType<
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TChainOverride extends Chain | undefined = Chain | undefined,
> = FormattedTransactionRequest<
  TChainOverride extends Chain ? TChainOverride : TChain
> &
  GetAccountParameter<TAccount> &
  GetChain<TChain, TChainOverride>

export type PrepareTransactionRequestErrorType =
  | AccountNotFoundErrorType
  | AssertRequestErrorType
  | ParseAccountErrorType
  | GetBlockErrorType
  | GetTransactionCountErrorType
  | EstimateGasErrorType
  | EstimateFeesPerGasErrorType

/**
 * Prepares a transaction request for signing.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/prepareTransactionRequest.html
 *
 * @param args - {@link PrepareTransactionRequestParameters}
 * @returns The transaction request. {@link PrepareTransactionRequestReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { prepareTransactionRequest } from 'viem/actions'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const request = await prepareTransactionRequest(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   to: '0x0000000000000000000000000000000000000000',
 *   value: 1n,
 * })
 *
 * @example
 * // Account Hoisting
 * import { createWalletClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { mainnet } from 'viem/chains'
 * import { prepareTransactionRequest } from 'viem/actions'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const request = await prepareTransactionRequest(client, {
 *   to: '0x0000000000000000000000000000000000000000',
 *   value: 1n,
 * })
 */
export async function prepareTransactionRequest<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
  TChainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  args: PrepareTransactionRequestParameters<TChain, TAccount, TChainOverride>,
): Promise<
  PrepareTransactionRequestReturnType<TChain, TAccount, TChainOverride>
> {
  const { account: account_ = client.account, chain, gas, nonce, type } = args
  if (!account_) throw new AccountNotFoundError()
  const account = parseAccount(account_)

  const block = await getAction(
    client,
    getBlock,
    'getBlock',
  )({ blockTag: 'latest' })

  const request = { ...args, from: account.address }

  if (typeof nonce === 'undefined')
    request.nonce = await getAction(
      client,
      getTransactionCount,
      'getTransactionCount',
    )({
      address: account.address,
      blockTag: 'pending',
    })

  if (typeof type === 'undefined') {
    try {
      request.type = getTransactionType(
        request as TransactionSerializable,
      ) as any
    } catch {
      // infer type from block
      request.type =
        typeof block.baseFeePerGas === 'bigint' ? 'eip1559' : 'legacy'
    }
  }

  if (request.type === 'eip1559') {
    // EIP-1559 fees
    const { maxFeePerGas, maxPriorityFeePerGas } =
      await internal_estimateFeesPerGas(client, {
        block,
        chain,
        request: request as PrepareTransactionRequestParameters,
      })

    if (
      typeof args.maxPriorityFeePerGas === 'undefined' &&
      args.maxFeePerGas &&
      args.maxFeePerGas < maxPriorityFeePerGas
    )
      throw new MaxFeePerGasTooLowError({
        maxPriorityFeePerGas,
      })

    request.maxPriorityFeePerGas = maxPriorityFeePerGas
    request.maxFeePerGas = maxFeePerGas
  } else {
    // Legacy fees
    if (
      typeof args.maxFeePerGas !== 'undefined' ||
      typeof args.maxPriorityFeePerGas !== 'undefined'
    )
      throw new Eip1559FeesNotSupportedError()

    const { gasPrice: gasPrice_ } = await internal_estimateFeesPerGas(client, {
      block,
      chain,
      request: request as PrepareTransactionRequestParameters,
      type: 'legacy',
    })
    request.gasPrice = gasPrice_
  }

  if (typeof gas === 'undefined')
    request.gas = await getAction(
      client,
      estimateGas,
      'estimateGas',
    )({
      ...request,
      account: { address: account.address, type: 'json-rpc' },
    } as EstimateGasParameters)

  assertRequest(request as AssertRequestParameters)

  return request as unknown as PrepareTransactionRequestReturnType<
    TChain,
    TAccount,
    TChainOverride
  >
}
