import type { Abi, Address, Narrow } from 'abitype'
import * as AbiError from 'ox/AbiError'
import * as AbiParameters from 'ox/AbiParameters'

import {
  type SendTransactionErrorType,
  sendTransaction,
} from '../../../actions/wallet/sendTransaction.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import type { BaseError } from '../../../errors/base.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { Account, GetAccountParameter } from '../../../types/account.js'
import type { Batches, Call } from '../../../types/calls.js'
import type {
  Chain,
  DeriveChain,
  GetChainParameter,
} from '../../../types/chain.js'
import type { Hex } from '../../../types/misc.js'
import type { UnionEvaluate, UnionPick } from '../../../types/utils.js'
import {
  type DecodeErrorResultErrorType,
  decodeErrorResult,
} from '../../../utils/abi/decodeErrorResult.js'
import {
  type EncodeFunctionDataErrorType,
  encodeFunctionData,
} from '../../../utils/abi/encodeFunctionData.js'
import {
  type GetContractErrorReturnType,
  getContractError,
} from '../../../utils/errors/getContractError.js'
import type { FormattedTransactionRequest } from '../../../utils/formatters/transactionRequest.js'
import { withCache } from '../../../utils/promise/withCache.js'
import { abi, executionMode } from '../constants.js'
import {
  ExecuteUnsupportedError,
  FunctionSelectorNotRecognizedError,
} from '../errors.js'
import { encodeCalls } from './execute.js'
import { supportsExecutionMode } from './supportsExecutionMode.js'

/** @internal */
export type Batch = { calls: readonly unknown[]; opData?: Hex | undefined }

export type ExecuteBatchesParameters<
  batches extends readonly Batch[] = readonly Batch[],
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = UnionEvaluate<
  UnionPick<
    FormattedTransactionRequest<_derivedChain>,
    | 'authorizationList'
    | 'gas'
    | 'gasPrice'
    | 'maxFeePerGas'
    | 'maxPriorityFeePerGas'
  >
> &
  GetAccountParameter<account, Account | Address, true, true> &
  GetChainParameter<chain, chainOverride> & {
    /** Address that will execute the calls. */
    address: Address
    /** Batches to execute. */
    batches: Batches<Narrow<batches>, { opData?: Hex | undefined }>
    /** Additional data to include for execution. */
    opData?: Hex | undefined
  }

export type ExecuteBatchesReturnType = Hex

export type ExecuteBatchesErrorType =
  | DecodeErrorResultErrorType
  | GetContractErrorReturnType
  | EncodeFunctionDataErrorType
  | SendTransactionErrorType
  | ErrorType

/**
 * Executes batches of call(s) using "batch of batches" mode on an [ERC-7821-compatible contract](https://eips.ethereum.org/EIPS/eip-7821).
 *
 * @example
 * ```ts
 * import { createClient, http, parseEther } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { mainnet } from 'viem/chains'
 * import { executeBatches } from 'viem/experimental/erc7821'
 *
 * const account = privateKeyToAccount('0x...')
 *
 * const client = createClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const hash = await executeBatches(client, {
 *   account,
 *   batches: [
 *     {
 *       calls: [
 *         {
 *           to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *           value: parseEther('1'),
 *         },
 *       ],
 *     },
 *     {
 *       calls: [
 *         {
 *           to: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
 *           value: parseEther('2'),
 *         },
 *         {
 *           data: '0xdeadbeef',
 *           to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *         },
 *       ],
 *     },
 *   ],
 *   to: account.address,
 * })
 * ```
 *
 * @example
 * ```ts
 * // Account Hoisting
 * import { createClient, http, parseEther } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { mainnet } from 'viem/chains'
 * import { executeBatches } from 'viem/experimental/erc7821'
 *
 * const account = privateKeyToAccount('0x...')
 *
 * const client = createClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const hash = await executeBatches(client, {
 *   batches: [
 *     {
 *       calls: [
 *         {
 *           to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *           value: parseEther('1'),
 *         },
 *       ],
 *     },
 *     {
 *       calls: [
 *         {
 *           to: '0xcb98643b8786950F0461f3B0edf99D88F274574D',
 *           value: parseEther('2'),
 *         },
 *         {
 *           data: '0xdeadbeef',
 *           to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *         },
 *       ],
 *     },
 *   ],
 *   to: account.address,
 * })
 * ```
 *
 * @param client - Client to use.
 * @param parameters - {@link ExecuteBatchesParameters}
 * @returns Transaction hash. {@link ExecuteBatchesReturnType}
 */
export async function executeBatches<
  batches extends readonly Batch[],
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: ExecuteBatchesParameters<batches, chain, account, chainOverride>,
): Promise<ExecuteBatchesReturnType> {
  const { authorizationList, batches } = parameters

  const address = authorizationList?.[0]?.contractAddress ?? parameters.address
  const encodedBatches = AbiParameters.encode(AbiParameters.from('bytes[]'), [
    batches.map((b) => {
      const batch = b as Batch
      return encodeCalls(batch.calls, batch.opData)
    }),
  ])

  const supported = await withCache(
    () =>
      supportsExecutionMode(client, {
        address,
        mode: 'batchOfBatches',
      }),
    {
      cacheKey: `supportsExecutionMode.${client.uid}.${address}.batchOfBatches`,
    },
  )
  if (!supported) throw new ExecuteUnsupportedError()

  try {
    return await sendTransaction(client, {
      ...parameters,
      to: parameters.address,
      data: encodeFunctionData({
        abi,
        functionName: 'execute',
        args: [executionMode.batchOfBatches, encodedBatches],
      }),
    } as any)
  } catch (e) {
    const error = (e as BaseError).walk((e) => 'data' in (e as Error)) as
      | (BaseError & { data?: Hex | undefined })
      | undefined

    if (!error?.data) throw e
    if (
      error.data ===
      AbiError.getSelector(AbiError.from('error FnSelectorNotRecognized()'))
    )
      throw new FunctionSelectorNotRecognizedError()

    let matched: Call | null = null
    for (const b of parameters.batches) {
      const batch = b as Batch
      for (const c of batch.calls) {
        const call = c as Call
        if (!call.abi) continue
        try {
          const matches = Boolean(
            decodeErrorResult({
              abi: call.abi,
              data: error.data!,
            }),
          )
          if (!matches) continue
          matched = call
        } catch {}
      }
    }
    if (!matched) throw e

    throw getContractError(error as BaseError, {
      abi: matched.abi as Abi,
      address: matched.to,
      args: matched.args,
      docsPath: '/experimental/erc7821/executeBatches',
      functionName: matched.functionName,
    })
  }
}
