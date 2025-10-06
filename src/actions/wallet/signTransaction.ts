import type { Account } from '../../accounts/types.js'
import {
  type ParseAccountErrorType,
  parseAccount,
} from '../../accounts/utils/parseAccount.js'
import type { SignTransactionErrorType as SignTransactionErrorType_account } from '../../accounts/utils/signTransaction.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../errors/account.js'
import type { ErrorType } from '../../errors/utils.js'
import type { GetAccountParameter } from '../../types/account.js'
import type {
  Chain,
  DeriveChain,
  GetChainParameter,
} from '../../types/chain.js'
import type { GetTransactionRequestKzgParameter } from '../../types/kzg.js'
import type { RpcTransactionRequest } from '../../types/rpc.js'
import type {
  TransactionRequest,
  TransactionSerializable,
  TransactionSerialized,
} from '../../types/transaction.js'
import type { UnionOmit } from '../../types/utils.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import {
  type AssertCurrentChainErrorType,
  assertCurrentChain,
} from '../../utils/chain/assertCurrentChain.js'
import type { NumberToHexErrorType } from '../../utils/encoding/toHex.js'
import { numberToHex } from '../../utils/encoding/toHex.js'
import {
  type FormattedTransactionRequest,
  formatTransactionRequest,
} from '../../utils/formatters/transactionRequest.js'
import { getAction } from '../../utils/getAction.js'
import {
  type AssertRequestErrorType,
  assertRequest,
} from '../../utils/transaction/assertRequest.js'
import type { GetTransactionType } from '../../utils/transaction/getTransactionType.js'
import { type GetChainIdErrorType, getChainId } from '../public/getChainId.js'

export type SignTransactionRequest<
  chain extends Chain | undefined = Chain | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  ///
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = UnionOmit<FormattedTransactionRequest<_derivedChain>, 'from'>

export type SignTransactionParameters<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  request extends SignTransactionRequest<
    chain,
    chainOverride
  > = SignTransactionRequest<chain, chainOverride>,
> = request &
  GetAccountParameter<account> &
  GetChainParameter<chain, chainOverride> &
  GetTransactionRequestKzgParameter<request>

export type SignTransactionReturnType<
  request extends SignTransactionRequest = SignTransactionRequest,
> = TransactionSerialized<GetTransactionType<request>>

export type SignTransactionErrorType =
  | ParseAccountErrorType
  | AssertRequestErrorType
  | GetChainIdErrorType
  | AssertCurrentChainErrorType
  | SignTransactionErrorType_account
  | NumberToHexErrorType
  | RequestErrorType
  | ErrorType

/**
 * Signs a transaction.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/signTransaction
 * - JSON-RPC Methods:
 *   - JSON-RPC Accounts: [`eth_signTransaction`](https://ethereum.github.io/execution-apis/api-documentation/)
 *   - Local Accounts: Signs locally. No JSON-RPC request.
 *
 * @param args - {@link SignTransactionParameters}
 * @returns The signed serialized transaction. {@link SignTransactionReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { signTransaction } from 'viem/actions'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const signature = await signTransaction(client, {
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
 * import { signTransaction } from 'viem/actions'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const signature = await signTransaction(client, {
 *   to: '0x0000000000000000000000000000000000000000',
 *   value: 1n,
 * })
 */
export async function signTransaction<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = undefined,
  const request extends SignTransactionRequest<
    chain,
    chainOverride
  > = SignTransactionRequest<chain, chainOverride>,
>(
  client: Client<Transport, chain, account>,
  parameters: SignTransactionParameters<chain, account, chainOverride, request>,
): Promise<SignTransactionReturnType<request>> {
  const {
    account: account_ = client.account,
    chain = client.chain,
    ...transaction
  } = parameters

  if (!account_)
    throw new AccountNotFoundError({
      docsPath: '/docs/actions/wallet/signTransaction',
    })
  const account = parseAccount(account_)

  assertRequest({
    account,
    ...parameters,
  })

  const chainId = await getAction(client, getChainId, 'getChainId')({})
  if (chain !== null)
    assertCurrentChain({
      currentChainId: chainId,
      chain,
    })

  const formatters = chain?.formatters || client.chain?.formatters
  const format =
    formatters?.transactionRequest?.format || formatTransactionRequest

  if (account.signTransaction)
    return account.signTransaction(
      {
        ...transaction,
        chainId,
      } as TransactionSerializable,
      { serializer: client.chain?.serializers?.transaction },
    ) as Promise<SignTransactionReturnType<request>>

  return await client.request(
    {
      method: 'eth_signTransaction',
      params: [
        {
          ...format(
            transaction as unknown as TransactionRequest,
            'signTransaction',
          ),
          chainId: numberToHex(chainId),
          from: account.address,
        } as unknown as RpcTransactionRequest,
      ],
    },
    { retryCount: 0 },
  )
}
