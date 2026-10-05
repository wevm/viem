import { BlockOverrides, Hex, StateOverrides, TransactionRequest } from 'ox'
import type { Address, Errors } from 'ox'

import type * as Account from '../Account.js'
import type * as Client from '../Client.js'
import { BaseError } from '../Errors.js'
import * as RpcError from '../RpcError.js'
import { isAbortError } from '../internal/errors.js'
import {
  type RequireCanonicalError,
  blockParameter,
} from './internal/blockParameter.js'
import type { offchainLookup } from './internal/ccip.js'
import {
  toDeploylessCallViaBytecodeData,
  toDeploylessCallViaFactoryData,
} from './internal/deployless.js'
import {
  getMulticallAddress,
  hasStateOverrideForAddress,
  scheduleMulticall,
  shouldPerformMulticall,
} from './internal/multicall.js'

type RequestOptions = Parameters<Client.Client['request']>[1]
type Context = {
  ccipReadLookupCount: number
}

/**
 * Executes a new message call without submitting a transaction to the network
 * (`eth_call`).
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const { data } = await Actions.call(client, {
 *   data: '0x06fdde03',
 *   to: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 * })
 * ```
 */
export function call(
  client: Client.Client,
  options: call.Options = {},
): Promise<call.ReturnType> {
  return call_(client, options, { ccipReadLookupCount: 0 })
}

async function call_(
  client: Client.Client,
  options: call.Options,
  context: Context,
): Promise<call.ReturnType> {
  const {
    account: account_ = client.account,
    batch = Boolean(client.batch?.multicall),
    blockHash,
    blockNumber,
    blockOverrides,
    blockTag = client.blockTag ?? 'latest',
    code,
    factory,
    factoryData,
    requestOptions,
    requireCanonical,
    stateOverride,
    ...rest
  } = options

  const from = account_
    ? typeof account_ === 'string'
      ? account_
      : account_.address
    : rest.from

  const { to } = rest
  const data_ = rest.data ?? rest.input

  if (code && (factory || factoryData))
    throw new BaseError(
      'Cannot provide both `code` & `factory`/`factoryData` as parameters.',
    )
  if (code && to)
    throw new BaseError('Cannot provide both `code` & `to` as parameters.')

  const deploylessCallViaBytecode = code && data_
  const deploylessCallViaFactory = factory && factoryData && to && data_
  const deploylessCall = deploylessCallViaBytecode || deploylessCallViaFactory

  const data = (() => {
    if (deploylessCallViaBytecode)
      return toDeploylessCallViaBytecodeData({ code, data: data_ })
    if (deploylessCallViaFactory)
      return toDeploylessCallViaFactoryData({
        data: data_,
        factory,
        factoryData,
        to,
      })
    return data_
  })()

  try {
    const block = blockParameter({
      blockHash,
      blockNumber,
      blockTag,
      requireCanonical,
    })

    const request = {
      ...rest,
      data,
      from,
      input: undefined,
      to: deploylessCall ? undefined : to,
    } satisfies TransactionRequest.toRpc.Input

    if (
      batch &&
      data &&
      to &&
      shouldPerformMulticall({ request }) &&
      !blockOverrides &&
      blockHash === undefined
    ) {
      const { deployless = false } =
        typeof client.batch?.multicall === 'object'
          ? client.batch.multicall
          : {}
      const multicallAddress = getMulticallAddress(client, {
        blockNumber,
        deployless,
      })

      if (
        !multicallAddress ||
        !hasStateOverrideForAddress(stateOverride, multicallAddress)
      )
        return await scheduleMulticall(client, {
          block:
            typeof blockNumber === 'bigint'
              ? Hex.fromNumber(blockNumber)
              : blockTag,
          data,
          multicallAddress,
          requestOptions,
          stateOverride,
          to,
        })
    }

    const request_ = TransactionRequest.toRpc(request)
    const response = await client.request(
      {
        method: 'eth_call',
        params: blockOverrides
          ? [
              request_,
              block,
              StateOverrides.toRpc(stateOverride ?? {}),
              BlockOverrides.toRpc(blockOverrides),
            ]
          : stateOverride
            ? [request_, block, StateOverrides.toRpc(stateOverride)]
            : [request_, block],
      },
      requestOptions,
    )
    if (response === '0x') return { data: undefined }
    return { data: response }
  } catch (err) {
    if (isAbortError(err)) throw err

    const data = getRevertErrorData(err)

    // Resolve ERC-3668 reverts when the client supplies a request policy.
    if (client.ccipRead && data?.slice(0, 10) === '0x556f1830' && to) {
      const { offchainLookup } = await import('./internal/ccip.js')
      return {
        data: await offchainLookup({
          blockNumber,
          blockTag,
          call: (options) =>
            call_(client, options, {
              ccipReadLookupCount: context.ccipReadLookupCount + 1,
            }),
          data,
          lookupCount: context.ccipReadLookupCount,
          request: client.ccipRead.request,
          requestOptions,
          to,
        }),
      }
    }

    if (deploylessCall && data?.slice(0, 10) === '0x101bb98d')
      throw new CounterfactualDeploymentFailedError({ factory })

    throw new RpcError.ExecutionError(err as Error, {
      ...rest,
      chain: client.chain,
      data: data_,
      from,
      stateOverride,
      to: to ?? undefined,
    })
  }
}

export declare namespace call {
  type Options = TransactionRequest.toRpc.Input & {
    /** Account (or address) attached to the call (`msg.sender`). */
    account?: Account.Account | Address.Address | undefined
    /** Enable multicall batching for this call. @default client.batch.multicall */
    batch?: boolean | undefined
    /** Block overrides for the call. */
    blockOverrides?: BlockOverrides.BlockOverrides | undefined
    /** Bytecode to perform the call on (deployless call via bytecode). */
    code?: Hex.Hex | undefined
    /** Deployment factory address (deployless call via factory). */
    factory?: Address.Address | undefined
    /** Calldata to execute on the factory to deploy the contract. */
    factoryData?: Hex.Hex | undefined
    /** Per-request transport options (signal, dedupe, …). */
    requestOptions?: RequestOptions
    /** State overrides for the call. */
    stateOverride?: StateOverrides.StateOverrides | undefined
  } & blockParameter.BlockOptions

  type ReturnType = {
    /** Return data of the call (or `undefined` for `0x`). */
    data: Hex.Hex | undefined
  }

  type ErrorType =
    | RpcError.ExecutionError
    | CounterfactualDeploymentFailedError
    | RequireCanonicalError
    | offchainLookup.ErrorType
    | Errors.GlobalErrorType
}

/**
 * Extracts revert data from a thrown RPC error by walking its `cause` chain.
 *
 * @internal
 */
export function getRevertErrorData(err: unknown): Hex.Hex | undefined {
  let error: unknown = err
  while (error) {
    const data = (error as { data?: unknown }).data
    if (typeof data === 'string' && data.startsWith('0x'))
      return data as Hex.Hex
    if (
      data &&
      typeof data === 'object' &&
      typeof (data as { data?: unknown }).data === 'string'
    )
      return (data as { data: Hex.Hex }).data
    error = (error as { cause?: unknown }).cause
  }
  return undefined
}

/** Thrown when a deployless call fails to deploy its counterfactual contract. */
export class CounterfactualDeploymentFailedError extends BaseError {
  override readonly name = 'CounterfactualDeploymentFailedError'

  constructor({ factory }: { factory?: Address.Address | undefined }) {
    super(
      'Deployment for counterfactual contract call failed.',
      factory
        ? {
            metaMessages: [
              `Factory Address: ${factory}`,
              '',
              'Please ensure:',
              '- The `factory` is a valid contract deployment factory (i.e. Create2 Factory, ERC-4337 Factory, etc).',
              '- The `factoryData` is a valid encoded function call for contract deployment function.',
            ],
          }
        : undefined,
    )
  }
}
