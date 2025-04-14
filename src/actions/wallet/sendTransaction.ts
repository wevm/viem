import type { Address } from 'abitype'

import type { Account } from '../../accounts/types.js'
import {
  type ParseAccountErrorType,
  parseAccount,
} from '../../accounts/utils/parseAccount.js'
import type { SignTransactionErrorType } from '../../accounts/utils/signTransaction.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import {
  AccountNotFoundError,
  type AccountNotFoundErrorType,
  AccountTypeNotSupportedError,
  type AccountTypeNotSupportedErrorType,
} from '../../errors/account.js'
import { BaseError } from '../../errors/base.js'
import type { ErrorType } from '../../errors/utils.js'
import type { GetAccountParameter } from '../../types/account.js'
import type { Chain, DeriveChain } from '../../types/chain.js'
import type { GetChainParameter } from '../../types/chain.js'
import type { GetTransactionRequestKzgParameter } from '../../types/kzg.js'
import type { Hash } from '../../types/misc.js'
import type { TransactionRequest } from '../../types/transaction.js'
import type { UnionOmit } from '../../types/utils.js'
import {
  type RecoverAuthorizationAddressErrorType,
  recoverAuthorizationAddress,
} from '../../utils/authorization/recoverAuthorizationAddress.js'
import type { RequestErrorType } from '../../utils/buildRequest.js'
import {
  type AssertCurrentChainErrorType,
  assertCurrentChain,
} from '../../utils/chain/assertCurrentChain.js'
import {
  type GetTransactionErrorReturnType,
  getTransactionError,
} from '../../utils/errors/getTransactionError.js'
import { extract } from '../../utils/formatters/extract.js'
import {
  type FormattedTransactionRequest,
  formatTransactionRequest,
} from '../../utils/formatters/transactionRequest.js'
import { getAction } from '../../utils/getAction.js'
import { LruMap } from '../../utils/lru.js'
import {
  type AssertRequestErrorType,
  type AssertRequestParameters,
  assertRequest,
} from '../../utils/transaction/assertRequest.js'
import { type GetChainIdErrorType, getChainId } from '../public/getChainId.js'
import {
  type PrepareTransactionRequestErrorType,
  defaultParameters,
  prepareTransactionRequest,
} from './prepareTransactionRequest.js'
import {
  type SendRawTransactionErrorType,
  sendRawTransaction,
} from './sendRawTransaction.js'

const supportsWalletNamespace = new LruMap<boolean>(128)

export type SendTransactionRequest<
  chain extends Chain | undefined = Chain | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  ///
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = UnionOmit<FormattedTransactionRequest<_derivedChain>, 'from'> &
  GetTransactionRequestKzgParameter

export type SendTransactionParameters<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  request extends SendTransactionRequest<
    chain,
    chainOverride
  > = SendTransactionRequest<chain, chainOverride>,
> = request &
  GetAccountParameter<account, Account | Address, true, true> &
  GetChainParameter<chain, chainOverride> &
  GetTransactionRequestKzgParameter<request>

export type SendTransactionReturnType = Hash

export type SendTransactionErrorType =
  | ParseAccountErrorType
  | GetTransactionErrorReturnType<
      | AccountNotFoundErrorType
      | AccountTypeNotSupportedErrorType
      | AssertCurrentChainErrorType
      | AssertRequestErrorType
      | GetChainIdErrorType
      | PrepareTransactionRequestErrorType
      | SendRawTransactionErrorType
      | RecoverAuthorizationAddressErrorType
      | SignTransactionErrorType
      | RequestErrorType
    >
  | ErrorType

/**
 * Creates, signs, and sends a new transaction to the network.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/sendTransaction
 * - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/transactions_sending-transactions
 * - JSON-RPC Methods:
 *   - JSON-RPC Accounts: [`eth_sendTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendtransaction)
 *   - Local Accounts: [`eth_sendRawTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendrawtransaction)
 *
 * @param client - Client to use
 * @param parameters - {@link SendTransactionParameters}
 * @returns The [Transaction](https://viem.sh/docs/glossary/terms#transaction) hash. {@link SendTransactionReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { sendTransaction } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const hash = await sendTransaction(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: 1000000000000000000n,
 * })
 *
 * @example
 * // Account Hoisting
 * import { createWalletClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { mainnet } from 'viem/chains'
 * import { sendTransaction } from 'viem/wallet'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const hash = await sendTransaction(client, {
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: 1000000000000000000n,
 * })
 */
export async function sendTransaction<
  chain extends Chain | undefined,
  account extends Account | undefined,
  const request extends SendTransactionRequest<chain, chainOverride>,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: SendTransactionParameters<chain, account, chainOverride, request>,
): Promise<SendTransactionReturnType> {
  const {
    account: account_ = client.account,
    chain = client.chain,
    accessList,
    authorizationList,
    blobs,
    data,
    gas,
    gasPrice,
    maxFeePerBlobGas,
    maxFeePerGas,
    maxPriorityFeePerGas,
    nonce,
    value,
    ...rest
  } = parameters

  if (typeof account_ === 'undefined')
    throw new AccountNotFoundError({
      docsPath: '/docs/actions/wallet/sendTransaction',
    })
  const account = account_ ? parseAccount(account_) : null

  try {
    assertRequest(parameters as AssertRequestParameters)

    const to = await (async () => {
      // If `to` exists on the parameters, use that.
      if (parameters.to) return parameters.to

      // If `to` is null, we are sending a deployment transaction.
      if (parameters.to === null) return undefined

      // If no `to` exists, and we are sending a EIP-7702 transaction, use the
      // address of the first authorization in the list.
      if (authorizationList && authorizationList.length > 0)
        return await recoverAuthorizationAddress({
          authorization: authorizationList[0],
        }).catch(() => {
          throw new BaseError(
            '`to` is required. Could not infer from `authorizationList`.',
          )
        })

      // Otherwise, we are sending a deployment transaction.
      return undefined
    })()

    if (account?.type === 'json-rpc' || account === null) {
      let chainId: number | undefined
      if (chain !== null) {
        chainId = await getAction(client, getChainId, 'getChainId')({})
        assertCurrentChain({
          currentChainId: chainId,
          chain,
        })
      }

      const chainFormat = client.chain?.formatters?.transactionRequest?.format
      const format = chainFormat || formatTransactionRequest

      const request = format({
        // Pick out extra data that might exist on the chain's transaction request type.
        ...extract(rest, { format: chainFormat }),
        accessList,
        authorizationList,
        blobs,
        chainId,
        data,
        from: account?.address,
        gas,
        gasPrice,
        maxFeePerBlobGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        to,
        value,
      } as TransactionRequest)

      const isWalletNamespaceSupported = supportsWalletNamespace.get(client.uid)
      const method = isWalletNamespaceSupported
        ? 'wallet_sendTransaction'
        : 'eth_sendTransaction'

      try {
        return await client.request(
          {
            method,
            params: [request],
          },
          { retryCount: 0 },
        )
      } catch (e) {
        if (isWalletNamespaceSupported === false) throw e

        const error = e as BaseError
        // If the transport does not support the method or input, attempt to use the
        // `wallet_sendTransaction` method.
        if (
          error.name === 'InvalidInputRpcError' ||
          error.name === 'InvalidParamsRpcError' ||
          error.name === 'MethodNotFoundRpcError' ||
          error.name === 'MethodNotSupportedRpcError'
        ) {
          return await client
            .request(
              {
                method: 'wallet_sendTransaction',
                params: [request],
              },
              { retryCount: 0 },
            )
            .then((hash) => {
              supportsWalletNamespace.set(client.uid, true)
              return hash
            })
            .catch((e) => {
              const walletNamespaceError = e as BaseError
              if (
                walletNamespaceError.name === 'MethodNotFoundRpcError' ||
                walletNamespaceError.name === 'MethodNotSupportedRpcError'
              ) {
                supportsWalletNamespace.set(client.uid, false)
                throw error
              }

              throw walletNamespaceError
            })
        }

        throw error
      }
    }

    if (account?.type === 'local') {
      // Prepare the request for signing (assign appropriate fees, etc.)
      const request = await getAction(
        client,
        prepareTransactionRequest,
        'prepareTransactionRequest',
      )({
        account,
        accessList,
        authorizationList,
        blobs,
        chain,
        data,
        gas,
        gasPrice,
        maxFeePerBlobGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        nonce,
        nonceManager: account.nonceManager,
        parameters: [...defaultParameters, 'sidecars'],
        value,
        ...rest,
        to,
      } as any)

      const serializer = chain?.serializers?.transaction
      const serializedTransaction = (await account.signTransaction(request, {
        serializer,
      })) as Hash
      return await getAction(
        client,
        sendRawTransaction,
        'sendRawTransaction',
      )({
        serializedTransaction,
      })
    }

    if (account?.type === 'smart')
      throw new AccountTypeNotSupportedError({
        metaMessages: [
          'Consider using the `sendUserOperation` Action instead.',
        ],
        docsPath: '/docs/actions/bundler/sendUserOperation',
        type: 'smart',
      })

    throw new AccountTypeNotSupportedError({
      docsPath: '/docs/actions/wallet/sendTransaction',
      type: (account as any)?.type,
    })
  } catch (err) {
    if (err instanceof AccountTypeNotSupportedError) throw err
    throw getTransactionError(err as BaseError, {
      ...parameters,
      account,
      chain: parameters.chain || undefined,
    })
  }
}
