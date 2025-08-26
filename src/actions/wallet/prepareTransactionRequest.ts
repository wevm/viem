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
  const {
    account: account_ = client.account,
    blobs,
    chain,
    gas,
    kzg,
    nonce,
    nonceManager,
    parameters = defaultParameters,
    type,
  } = args
  const account = account_ ? parseAccount(account_) : account_

  const request = { ...args, ...(account ? { from: account?.address } : {}) }

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

  let chainId: number | undefined
  async function getChainId(): Promise<number> {
    if (chainId) return chainId
    if (chain) return chain.id
    if (typeof args.chainId !== 'undefined') return args.chainId
    const chainId_ = await getAction(client, getChainId_, 'getChainId')({})
    chainId = chainId_
    return chainId
  }

  if (parameters.includes('nonce') && typeof nonce === 'undefined' && account) {
    if (nonceManager) {
      const chainId = await getChainId()
      request.nonce = await nonceManager.consume({
        address: account.address,
        chainId,
        client,
      })
    } else {
      request.nonce = await getAction(
        client,
        getTransactionCount,
        'getTransactionCount',
      )({
        address: account.address,
        blockTag: 'pending',
      })
    }
  }

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
          typeof args.maxPriorityFeePerGas === 'undefined' &&
          args.maxFeePerGas &&
          args.maxFeePerGas < maxPriorityFeePerGas
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
        typeof args.maxFeePerGas !== 'undefined' ||
        typeof args.maxPriorityFeePerGas !== 'undefined'
      )
        throw new Eip1559FeesNotSupportedError()

      if (typeof args.gasPrice === 'undefined') {
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
      account: account
        ? { address: account.address, type: 'json-rpc' }
        : account,
    } as EstimateGasParameters)

  assertRequest(request as AssertRequestParameters)

  delete request.parameters

  return request as any
}
