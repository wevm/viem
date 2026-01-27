import type { Address } from 'abitype'
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
  getBlock as getBlock_,
} from '../../actions/public/getBlock.js'
import {
  type GetTransactionCountErrorType,
  getTransactionCount,
} from '../../actions/public/getTransactionCount.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { AccountNotFoundErrorType } from '../../errors/account.js'
import type { BaseError } from '../../errors/base.js'
import {
  Eip1559FeesNotSupportedError,
  MaxFeePerGasTooLowError,
} from '../../errors/fee.js'
import type { DeriveAccount, GetAccountParameter } from '../../types/account.js'
import type { Block } from '../../types/block.js'
import type {
  Chain,
  DeriveChain,
  GetChainParameter,
} from '../../types/chain.js'
import type { GetTransactionRequestKzgParameter } from '../../types/kzg.js'
import type {
  TransactionRequest,
  TransactionRequestEIP1559,
  TransactionRequestEIP2930,
  TransactionRequestEIP4844,
  TransactionRequestEIP7702,
  TransactionRequestLegacy,
  TransactionSerializable,
} from '../../types/transaction.js'
import type {
  ExactPartial,
  IsNever,
  Prettify,
  UnionOmit,
  UnionRequiredBy,
} from '../../types/utils.js'
import { blobsToCommitments } from '../../utils/blob/blobsToCommitments.js'
import { blobsToProofs } from '../../utils/blob/blobsToProofs.js'
import { commitmentsToVersionedHashes } from '../../utils/blob/commitmentsToVersionedHashes.js'
import { toBlobSidecars } from '../../utils/blob/toBlobSidecars.js'
import type { FormattedTransactionRequest } from '../../utils/formatters/transactionRequest.js'
import { getAction } from '../../utils/getAction.js'
import { LruMap } from '../../utils/lru.js'
import type { NonceManager } from '../../utils/nonceManager.js'
import {
  type AssertRequestErrorType,
  type AssertRequestParameters,
  assertRequest,
} from '../../utils/transaction/assertRequest.js'
import {
  type GetTransactionType,
  getTransactionType,
} from '../../utils/transaction/getTransactionType.js'
import {
  type FillTransactionErrorType,
  type FillTransactionParameters,
  fillTransaction,
} from '../public/fillTransaction.js'
import { getChainId as getChainId_ } from '../public/getChainId.js'

export const defaultParameters = [
  'blobVersionedHashes',
  'chainId',
  'fees',
  'gas',
  'nonce',
  'type',
] as const

/** @internal */
export const eip1559NetworkCache = /*#__PURE__*/ new Map<string, boolean>()

/** @internal */
export const supportsFillTransaction = /*#__PURE__*/ new LruMap<boolean>(128)

export type PrepareTransactionRequestParameterType =
  | 'blobVersionedHashes'
  | 'chainId'
  | 'fees'
  | 'gas'
  | 'nonce'
  | 'sidecars'
  | 'type'
type ParameterTypeToParameters<
  parameterType extends PrepareTransactionRequestParameterType,
> = parameterType extends 'fees'
  ? 'maxFeePerGas' | 'maxPriorityFeePerGas' | 'gasPrice'
  : parameterType

export type PrepareTransactionRequestRequest<
  chain extends Chain | undefined = Chain | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  ///
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = UnionOmit<FormattedTransactionRequest<_derivedChain>, 'from'> &
  GetTransactionRequestKzgParameter & {
    /**
     * Nonce manager to use for the transaction request.
     */
    nonceManager?: NonceManager | undefined
    /**
     * Parameters to prepare for the transaction request.
     *
     * @default ['blobVersionedHashes', 'chainId', 'fees', 'gas', 'nonce', 'type']
     */
    parameters?: readonly PrepareTransactionRequestParameterType[] | undefined
  }

export type PrepareTransactionRequestParameters<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  accountOverride extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
  request extends PrepareTransactionRequestRequest<
    chain,
    chainOverride
  > = PrepareTransactionRequestRequest<chain, chainOverride>,
> = request &
  GetAccountParameter<account, accountOverride, false, true> &
  GetChainParameter<chain, chainOverride> &
  GetTransactionRequestKzgParameter<request> & { chainId?: number | undefined }

export type PrepareTransactionRequestReturnType<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  accountOverride extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
  request extends PrepareTransactionRequestRequest<
    chain,
    chainOverride
  > = PrepareTransactionRequestRequest<chain, chainOverride>,
  ///
  _derivedAccount extends Account | Address | undefined = DeriveAccount<
    account,
    accountOverride
  >,
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
  _transactionType = request['type'] extends string | undefined
    ? request['type']
    : GetTransactionType<request> extends 'legacy'
      ? unknown
      : GetTransactionType<request>,
  _transactionRequest extends TransactionRequest =
    | (_transactionType extends 'legacy' ? TransactionRequestLegacy : never)
    | (_transactionType extends 'eip1559' ? TransactionRequestEIP1559 : never)
    | (_transactionType extends 'eip2930' ? TransactionRequestEIP2930 : never)
    | (_transactionType extends 'eip4844' ? TransactionRequestEIP4844 : never)
    | (_transactionType extends 'eip7702' ? TransactionRequestEIP7702 : never),
> = Prettify<
  UnionRequiredBy<
    Extract<
      UnionOmit<FormattedTransactionRequest<_derivedChain>, 'from'> &
        (_derivedChain extends Chain
          ? { chain: _derivedChain }
          : { chain?: undefined }) &
        (_derivedAccount extends Account
          ? { account: _derivedAccount; from: Address }
          : { account?: undefined; from?: undefined }),
      IsNever<_transactionRequest> extends true
        ? unknown
        : ExactPartial<_transactionRequest>
    > & { chainId?: number | undefined },
    ParameterTypeToParameters<
      request['parameters'] extends readonly PrepareTransactionRequestParameterType[]
        ? request['parameters'][number]
        : (typeof defaultParameters)[number]
    >
  > &
    (unknown extends request['kzg'] ? {} : Pick<request, 'kzg'>)
>

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
 * - Docs: https://viem.sh/docs/actions/wallet/prepareTransactionRequest
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
  chain extends Chain | undefined,
  account extends Account | undefined,
  const request extends PrepareTransactionRequestRequest<chain, chainOverride>,
  accountOverride extends Account | Address | undefined = undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  args: PrepareTransactionRequestParameters<
    chain,
    account,
    chainOverride,
    accountOverride,
    request
  >,
): Promise<
  PrepareTransactionRequestReturnType<
    chain,
    account,
    chainOverride,
    accountOverride,
    request
  >
> {
  let request = args as PrepareTransactionRequestParameters

  request.account ??= client.account
  request.parameters ??= defaultParameters

  const {
    account: account_,
    chain = client.chain,
    nonceManager,
    parameters,
  } = request

  const prepareTransactionRequest = (() => {
    if (typeof chain?.prepareTransactionRequest === 'function')
      return {
        fn: chain.prepareTransactionRequest,
        runAt: ['beforeFillTransaction'],
      }
    if (Array.isArray(chain?.prepareTransactionRequest))
      return {
        fn: chain.prepareTransactionRequest[0],
        runAt: chain.prepareTransactionRequest[1].runAt,
      }
    return undefined
  })()

  let chainId: number | undefined
  async function getChainId(): Promise<number> {
    if (chainId) return chainId
    if (typeof request.chainId !== 'undefined') return request.chainId
    if (chain) return chain.id
    const chainId_ = await getAction(client, getChainId_, 'getChainId')({})
    chainId = chainId_
    return chainId
  }

  const account = account_ ? parseAccount(account_) : account_

  let nonce = request.nonce
  if (
    parameters.includes('nonce') &&
    typeof nonce === 'undefined' &&
    account &&
    nonceManager
  ) {
    const chainId = await getChainId()
    nonce = await nonceManager.consume({
      address: account.address,
      chainId,
      client,
    })
  }

  if (
    prepareTransactionRequest?.fn &&
    prepareTransactionRequest.runAt?.includes('beforeFillTransaction')
  ) {
    request = await prepareTransactionRequest.fn(
      { ...request, chain },
      {
        phase: 'beforeFillTransaction',
      },
    )
    nonce ??= request.nonce
  }

  const attemptFill = (() => {
    // Do not attempt if blobs are provided.
    if (
      (parameters.includes('blobVersionedHashes') ||
        parameters.includes('sidecars')) &&
      request.kzg &&
      request.blobs
    )
      return false

    // Do not attempt if `eth_fillTransaction` is not supported.
    if (supportsFillTransaction.get(client.uid) === false) return false

    // Should attempt `eth_fillTransaction` if "fees" or "gas" are required to be populated,
    // otherwise, can just use the other individual calls.
    const shouldAttempt = ['fees', 'gas'].some((parameter) =>
      parameters.includes(parameter as PrepareTransactionRequestParameterType),
    )
    if (!shouldAttempt) return false

    // Check if `eth_fillTransaction` needs to be called.
    if (parameters.includes('chainId') && typeof request.chainId !== 'number')
      return true
    if (parameters.includes('nonce') && typeof nonce !== 'number') return true
    if (
      parameters.includes('fees') &&
      typeof request.gasPrice !== 'bigint' &&
      (typeof request.maxFeePerGas !== 'bigint' ||
        typeof (request as any).maxPriorityFeePerGas !== 'bigint')
    )
      return true
    if (parameters.includes('gas') && typeof request.gas !== 'bigint')
      return true
    return false
  })()

  const fillResult = attemptFill
    ? await getAction(
        client,
        fillTransaction,
        'fillTransaction',
      )({ ...request, nonce } as FillTransactionParameters)
        .then((result) => {
          const {
            chainId,
            from,
            gas,
            gasPrice,
            nonce,
            maxFeePerBlobGas,
            maxFeePerGas,
            maxPriorityFeePerGas,
            type,
            ...rest
          } = result.transaction
          supportsFillTransaction.set(client.uid, true)
          return {
            ...request,
            ...(from ? { from } : {}),
            ...(type ? { type } : {}),
            ...(typeof chainId !== 'undefined' ? { chainId } : {}),
            ...(typeof gas !== 'undefined' ? { gas } : {}),
            ...(typeof gasPrice !== 'undefined' ? { gasPrice } : {}),
            ...(typeof nonce !== 'undefined' ? { nonce } : {}),
            ...(typeof maxFeePerBlobGas !== 'undefined'
              ? { maxFeePerBlobGas }
              : {}),
            ...(typeof maxFeePerGas !== 'undefined' ? { maxFeePerGas } : {}),
            ...(typeof maxPriorityFeePerGas !== 'undefined'
              ? { maxPriorityFeePerGas }
              : {}),
            ...('nonceKey' in rest && typeof rest.nonceKey !== 'undefined'
              ? { nonceKey: rest.nonceKey }
              : {}),
          }
        })
        .catch((e) => {
          const error = e as FillTransactionErrorType

          if (error.name !== 'TransactionExecutionError') return request

          const unsupported = error.walk?.((e) => {
            const error = e as BaseError
            return (
              error.name === 'MethodNotFoundRpcError' ||
              error.name === 'MethodNotSupportedRpcError'
            )
          })
          if (unsupported) supportsFillTransaction.set(client.uid, false)

          return request
        })
    : request

  nonce ??= fillResult.nonce

  request = {
    ...(fillResult as any),
    ...(account ? { from: account?.address } : {}),
    ...(nonce ? { nonce } : {}),
  }
  const { blobs, gas, kzg, type } = request

  if (
    prepareTransactionRequest?.fn &&
    prepareTransactionRequest.runAt?.includes('beforeFillParameters')
  ) {
    request = await prepareTransactionRequest.fn(
      { ...request, chain },
      {
        phase: 'beforeFillParameters',
      },
    )
  }

  let block: Block | undefined
  async function getBlock(): Promise<Block> {
    if (block) return block
    block = await getAction(
      client,
      getBlock_,
      'getBlock',
    )({ blockTag: 'latest' })
    return block
  }

  if (
    parameters.includes('nonce') &&
    typeof nonce === 'undefined' &&
    account &&
    !nonceManager
  )
    request.nonce = await getAction(
      client,
      getTransactionCount,
      'getTransactionCount',
    )({
      address: account.address,
      blockTag: 'pending',
    })

  if (
    (parameters.includes('blobVersionedHashes') ||
      parameters.includes('sidecars')) &&
    blobs &&
    kzg
  ) {
    const commitments = blobsToCommitments({ blobs, kzg })

    if (parameters.includes('blobVersionedHashes')) {
      const versionedHashes = commitmentsToVersionedHashes({
        commitments,
        to: 'hex',
      })
      request.blobVersionedHashes = versionedHashes
    }
    if (parameters.includes('sidecars')) {
      const proofs = blobsToProofs({ blobs, commitments, kzg })
      const sidecars = toBlobSidecars({
        blobs,
        commitments,
        proofs,
        to: 'hex',
      })
      request.sidecars = sidecars
    }
  }

  if (parameters.includes('chainId')) request.chainId = await getChainId()

  if (
    (parameters.includes('fees') || parameters.includes('type')) &&
    typeof type === 'undefined'
  ) {
    try {
      request.type = getTransactionType(
        request as TransactionSerializable,
      ) as any
    } catch {
      let isEip1559Network = eip1559NetworkCache.get(client.uid)
      if (typeof isEip1559Network === 'undefined') {
        const block = await getBlock()
        isEip1559Network = typeof block?.baseFeePerGas === 'bigint'
        eip1559NetworkCache.set(client.uid, isEip1559Network)
      }
      request.type = isEip1559Network ? 'eip1559' : 'legacy'
    }
  }

  if (parameters.includes('fees')) {
    // TODO(4844): derive blob base fees once https://github.com/ethereum/execution-apis/pull/486 is merged.

    if (request.type !== 'legacy' && request.type !== 'eip2930') {
      // EIP-1559 fees
      if (
        typeof request.maxFeePerGas === 'undefined' ||
        typeof request.maxPriorityFeePerGas === 'undefined'
      ) {
        const block = await getBlock()
        const { maxFeePerGas, maxPriorityFeePerGas } =
          await internal_estimateFeesPerGas(client, {
            block: block as Block,
            chain,
            request: request as PrepareTransactionRequestParameters,
          })

        if (
          typeof request.maxPriorityFeePerGas === 'undefined' &&
          request.maxFeePerGas &&
          request.maxFeePerGas < maxPriorityFeePerGas
        )
          throw new MaxFeePerGasTooLowError({
            maxPriorityFeePerGas,
          })

        request.maxPriorityFeePerGas = maxPriorityFeePerGas
        request.maxFeePerGas = maxFeePerGas
      }
    } else {
      // Legacy fees
      if (
        typeof request.maxFeePerGas !== 'undefined' ||
        typeof request.maxPriorityFeePerGas !== 'undefined'
      )
        throw new Eip1559FeesNotSupportedError()

      if (typeof request.gasPrice === 'undefined') {
        const block = await getBlock()
        const { gasPrice: gasPrice_ } = await internal_estimateFeesPerGas(
          client,
          {
            block: block as Block,
            chain,
            request: request as PrepareTransactionRequestParameters,
            type: 'legacy',
          },
        )
        request.gasPrice = gasPrice_
      }
    }
  }

  if (parameters.includes('gas') && typeof gas === 'undefined')
    request.gas = await getAction(
      client,
      estimateGas,
      'estimateGas',
    )({
      ...request,
      account,
      prepare: account?.type === 'local' ? [] : ['blobVersionedHashes'],
    } as EstimateGasParameters)

  if (
    prepareTransactionRequest?.fn &&
    prepareTransactionRequest.runAt?.includes('afterFillParameters')
  )
    request = await prepareTransactionRequest.fn(
      { ...request, chain },
      {
        phase: 'afterFillParameters',
      },
    )

  assertRequest(request as AssertRequestParameters)

  delete request.parameters

  return request as any
}
