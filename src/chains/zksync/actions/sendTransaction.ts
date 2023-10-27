import type { Account } from '../../../accounts/types.js'
import {
  type ParseAccountErrorType,
  parseAccount,
} from '../../../accounts/utils/parseAccount.js'
import type { SignTransactionErrorType } from '../../../accounts/utils/signTransaction.js'
import {
  type GetChainIdErrorType,
  getChainId,
} from '../../../actions/public/getChainId.js'
import {
  type SendRawTransactionReturnType,
  sendRawTransaction,
} from '../../../actions/wallet/sendRawTransaction.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { AccountNotFoundError } from '../../../errors/account.js'
import { BaseError } from '../../../errors/base.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { GetAccountParameter } from '../../../types/account.js'
import {
  type Chain,
  type ExtractChainFormatterParameters,
} from '../../../types/chain.js'
import type { GetChain } from '../../../types/chain.js'
import type { Hash } from '../../../types/misc.js'
import type {
  TransactionRequest,
  TransactionSerializable,
} from '../../../types/transaction.js'
import type { UnionOmit } from '../../../types/utils.js'
import type { RequestErrorType } from '../../../utils/buildRequest.js'
import {
  type AssertCurrentChainErrorType,
  assertCurrentChain,
} from '../../../utils/chain/assertCurrentChain.js'
import {
  type GetTransactionErrorParameters,
  type GetTransactionErrorReturnType,
  getTransactionError,
} from '../../../utils/errors/getTransactionError.js'
import { extract } from '../../../utils/formatters/extract.js'
import { formatTransactionRequest } from '../../../utils/formatters/transactionRequest.js'
import { getAction } from '../../../utils/getAction.js'
import {
  type AssertRequestErrorType,
  type AssertRequestParameters,
  assertRequest,
} from '../../../utils/transaction/assertRequest.js'
import {
  type ChainEIP712,
  type TransactionRequestEIP712,
  isEip712Transaction,
} from '../types.js'
import {
  type PrepareTransactionRequestErrorType,
  prepareTransactionRequest,
} from './prepareTransactionRequest.js'
import {
  type SignEip712TransactionParameters,
  signEip712Transaction,
} from './signTransaction.js'

export type FormattedTransactionRequest<
  TChain extends Chain | undefined = Chain | undefined,
> = ExtractChainFormatterParameters<
  TChain,
  'transactionRequest',
  TransactionRequestEIP712
>

export type SendTransactionParameters<
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

export type SendTransactionReturnType = Hash

export type SendTransactionErrorType =
  | ParseAccountErrorType
  | GetTransactionErrorReturnType<
      | AssertCurrentChainErrorType
      | AssertRequestErrorType
      | GetChainIdErrorType
      | PrepareTransactionRequestErrorType
      | SendRawTransactionReturnType
      | SignTransactionErrorType
      | RequestErrorType
    >
  | ErrorType

/**
 * Creates, signs, and sends a new transaction to the network.
 *
 * - Docs: https://viem.sh/docs/zksync/actions/sendEip712Transaction.html
 * - JSON-RPC Methods:
 *   - JSON-RPC Accounts: [`eth_sendTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendtransaction)
 *   - Local Accounts: [`eth_sendRawTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendrawtransaction)
 *
 * @param client - Client to use
 * @param parameters - {@link SendTransactionParameters}
 * @returns The [Transaction](https://viem.sh/docs/glossary/terms.html#transaction) hash. {@link SendTransactionReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { zkSync } from 'viem/chains'
 * import { sendEip712Transaction } from 'viem/chains/zksync'
 *
 * const client = createWalletClient({
 *   chain: zkSync,
 *   transport: custom(window.ethereum),
 * })
 * const hash = await sendEip712Transaction(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: 1000000000000000000n,
 * })
 *
 * @example
 * // Account Hoisting
 * import { createWalletClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { zkSync } from 'viem/chains'
 * import { sendEip712Transaction } from 'viem/chains/zksync'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: zkSync,
 *   transport: http(),
 * })
 * const hash = await sendEip712Transaction(client, {
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: 1000000000000000000n,
 * })
 */
export async function sendTransaction<
  TChain extends ChainEIP712 | undefined,
  TAccount extends Account | undefined,
  TChainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  args: SendTransactionParameters<TChain, TAccount, TChainOverride>,
): Promise<SendTransactionReturnType> {
  const {
    account: account_ = client.account,
    chain = client.chain,
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

  if (!account_)
    throw new AccountNotFoundError({
      docsPath: '/docs/actions/wallet/sendTransaction',
    })
  const account = parseAccount(account_)

  try {
    assertRequest(args as AssertRequestParameters)

    let chainId
    if (chain !== null) {
      chainId = await getAction(client, getChainId)({})
      assertCurrentChain({
        currentChainId: chainId,
        chain,
      })
    }

    const transaction = {
      account,
      accessList,
      data,
      gas,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      to,
      value,
      ...rest,
    }

    if (
      client.chain?.eip712domain?.eip712domain &&
      isEip712Transaction(transaction as unknown as TransactionSerializable)
    ) {
      const eip712signer = client.chain?.eip712domain?.eip712domain

      if (eip712signer === undefined)
        throw new BaseError('Chain doesnt define EIP712 signer.')

      // Prepare the request for signing (assign appropriate fees, etc.)
      const request = await getAction(
        client,
        prepareTransactionRequest,
      )(transaction as any)

      if (!chainId) chainId = await getAction(client, getChainId)({})

      // EIP712 sign will be done inside the sign transaction
      const serializedTransaction = (await signEip712Transaction(client, {
        ...request,
        chainId,
      } as unknown as SignEip712TransactionParameters)) as Hash

      return await getAction(
        client,
        sendRawTransaction,
      )({
        serializedTransaction,
      })
    }

    if (account.type === 'local') {
      // Prepare the request for signing (assign appropriate fees, etc.)
      const request = await getAction(
        client,
        prepareTransactionRequest,
      )({
        account,
        accessList,
        chain,
        data,
        gas,
        gasPrice,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        to,
        value,
        ...rest,
      } as any)

      if (!chainId) chainId = await getAction(client, getChainId)({})

      const serializer = chain?.serializers?.transaction
      const serializedTransaction = (await account.signTransaction(
        {
          ...request,
          chainId,
        } as TransactionSerializable,
        { serializer },
      )) as Hash
      return await getAction(
        client,
        sendRawTransaction,
      )({
        serializedTransaction,
      })
    }

    const chainFormat = client.chain?.formatters?.transactionRequest?.format
    const format = chainFormat || formatTransactionRequest

    const request = format({
      // Pick out extra data that might exist on the chain's transaction request type.
      ...extract(rest, { format: chainFormat }),
      accessList,
      data,
      from: account.address,
      gas,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      to,
      value,
    } as TransactionRequest)
    return await client.request({
      method: 'eth_sendTransaction',
      params: [request],
    })
  } catch (err) {
    throw getTransactionError(err as BaseError, {
      ...(args as GetTransactionErrorParameters),
      account,
      chain: args.chain || undefined,
    })
  }
}
