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
import { prepareTransactionRequest } from '../../../actions/wallet/prepareTransactionRequest.js'
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
import { type ChainEIP712, isEip712Transaction } from '../types/chain.js'

export type PrepareEip712TransactionRequestParameters<
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

export type PrepareEip712TransactionRequestReturnType<
  TChain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  TAccount extends Account | undefined = Account | undefined,
  TChainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
> = FormattedTransactionRequest<
  TChainOverride extends ChainEIP712 ? TChainOverride : TChain
> &
  GetAccountParameter<TAccount> &
  GetChain<TChain, TChainOverride>

export type PrepareEip712TransactionRequestErrorType =
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
 * @param args - {@link PrepareEip712TransactionRequestParameters}
 * @returns The transaction request. {@link PrepareEip712TransactionRequestReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { zkSync } from 'viem/chains'
 * import { prepareEip712TransactionRequest } from 'viem/chains/zksync'
 *
 * const client = createWalletClient({
 *   chain: zkSync,
 *   transport: custom(window.ethereum),
 * })
 * const request = await prepareEip712TransactionRequest(client, {
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
export async function prepareEip712TransactionRequest<
  TChain extends ChainEIP712 | undefined,
  TAccount extends Account | undefined,
  TChainOverride extends ChainEIP712 | undefined = undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  args: PrepareEip712TransactionRequestParameters<
    TChain,
    TAccount,
    TChainOverride
  >,
): Promise<
  PrepareEip712TransactionRequestReturnType<TChain, TAccount, TChainOverride>
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

    return request as unknown as PrepareEip712TransactionRequestReturnType<
      TChain,
      TAccount,
      TChainOverride
    >
  }

  return prepareTransactionRequest(
    client,
    args as unknown as PrepareEip712TransactionRequestParameters,
  ) as unknown as PrepareEip712TransactionRequestReturnType<
    TChain,
    TAccount,
    TChainOverride
  >
}
