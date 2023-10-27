import type { Account } from '../../../accounts/types.js'
import {
  type ParseAccountErrorType,
  parseAccount,
} from '../../../accounts/utils/parseAccount.js'
import { type EstimateFeesPerGasErrorType } from '../../../actions/public/estimateFeesPerGas.js'
import {
  type EstimateGasErrorType,
  type EstimateGasParameters,
  estimateGas,
} from '../../../actions/public/estimateGas.js'
import { type GetBlockErrorType } from '../../../actions/public/getBlock.js'
import {
  type GetTransactionCountErrorType,
  getTransactionCount,
} from '../../../actions/public/getTransactionCount.js'
import { prepareTransactionRequest as originalPrepareTransactionRequest } from '../../../actions/wallet/prepareTransactionRequest.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import {
  AccountNotFoundError,
  type AccountNotFoundErrorType,
} from '../../../errors/account.js'
import type { GetAccountParameter } from '../../../types/account.js'
import type { GetChain } from '../../../types/chain.js'
import { type TransactionSerializable } from '../../../types/transaction.js'
import type { UnionOmit } from '../../../types/utils.js'
import type { FormattedTransactionRequest } from '../../../utils/formatters/transactionRequest.js'
import { getAction } from '../../../utils/getAction.js'
import type {
  AssertRequestErrorType,
  AssertRequestParameters,
} from '../../../utils/transaction/assertRequest.js'
import { assertRequest } from '../../../utils/transaction/assertRequest.js'
import { type GetTransactionType } from '../../../utils/transaction/getTransactionType.js'
import { type ChainEIP712, isEip712Transaction } from '../types.js'

export type PrepareTransactionRequestParameters<
  TChain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TChainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
> = UnionOmit<
  FormattedTransactionRequest<
    TChainOverride extends ChainEIP712 ? TChainOverride : TChain
  >,
  'from'
> &
  GetAccountParameter<TAccount> &
  GetChain<TChain, TChainOverride>

export type PrepareTransactionRequestReturnType<
  TChain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TChainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
> = FormattedTransactionRequest<
  TChainOverride extends ChainEIP712 ? TChainOverride : TChain
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
 * - Docs: https://viem.sh/docs/zksync/actions/prepareEip712TransactionRequest.html
 *
 * @param args - {@link PrepareTransactionRequestParameters}
 * @returns The transaction request. {@link PrepareTransactionRequestReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { zkSync } from 'viem/chains'
 * import { prepareTransactionRequest } from 'viem/chains/zksync'
 *
 * const client = createWalletClient({
 *   chain: zkSync,
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
 * import { zkSync } from 'viem/chains'
 * import { prepareEip712TransactionRequest } from 'viem/chains/zksync'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: zkSync,
 *   transport: custom(window.ethereum),
 * })
 * const request = await prepareEip712TransactionRequest(client, {
 *   to: '0x0000000000000000000000000000000000000000',
 *   value: 1n,
 * })
 */
export async function prepareTransactionRequest<
  TChain extends ChainEIP712 | undefined,
  TAccount extends Account | undefined,
  TChainOverride extends ChainEIP712 | undefined = undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  args: PrepareTransactionRequestParameters<TChain, TAccount, TChainOverride>,
): Promise<
  PrepareTransactionRequestReturnType<TChain, TAccount, TChainOverride>
> {
  const { account: account_ = client.account, nonce, gas } = args
  if (!account_) throw new AccountNotFoundError()
  const account = parseAccount(account_)

  const request = { ...args, from: account.address }

  if (typeof nonce === 'undefined') {
    request.nonce = await getAction(
      client,
      getTransactionCount,
    )({
      address: account.address,
      blockTag: 'pending',
    })
  }

  if (isEip712Transaction(request as TransactionSerializable)) {
    request.type =
      'eip712' as GetTransactionType<TransactionSerializable> as any
    // Do nothing...

    assertRequest(request as AssertRequestParameters)

    if (typeof gas === 'undefined') {
      request.gas = await getAction(
        client,
        estimateGas,
      )({
        ...request,
        account: { address: account.address, type: 'json-rpc' },
      } as EstimateGasParameters)
    }

    return request as unknown as PrepareTransactionRequestReturnType<
      TChain,
      TAccount,
      TChainOverride
    >
  }

  return originalPrepareTransactionRequest(
    client,
    args as unknown as PrepareTransactionRequestParameters,
  ) as unknown as PrepareTransactionRequestReturnType<
    TChain,
    TAccount,
    TChainOverride
  >
}
