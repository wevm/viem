import * as AbiFunction from 'ox/AbiFunction'
import * as Address from 'ox/Address'
import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'
import * as StateOverrides from 'ox/StateOverrides'

import type * as Client from '../../Client.js'
import { BaseError } from '../../Errors.js'
import { getChainContractAddress } from '../../../chains/utils.js'
import { createBatchScheduler } from '../../internal/promise.js'
import {
  aggregate3Abi,
  aggregate3Signature,
  multicall3Bytecode,
} from './constants.js'
import { toDeploylessCallViaBytecodeData } from './deployless.js'

type RequestOptions = Parameters<Client.Client['request']>[1]

/**
 * Whether a request is eligible for multicall aggregation. Only calls with
 * calldata + a target and no other transaction fields (`nonce`, `gas`, …) can
 * be batched, and a call already targeting `aggregate3` is skipped.
 */
export function shouldPerformMulticall(options: {
  request: {
    data?: Hex.Hex | undefined
    to?: Address.Address | null | undefined
  }
}): boolean {
  const { data, to, ...rest } = options.request
  if (!data) return false
  if (data.startsWith(aggregate3Signature)) return false
  if (!to) return false
  if (Object.values(rest).filter((x) => typeof x !== 'undefined').length > 0)
    return false
  return true
}

/**
 * Resolves the multicall3 contract address for a client. Returns `null` to
 * signal a deployless multicall: when `deployless` is requested, when the
 * client has no chain, or when the chain does not deploy multicall3.
 */
export function getMulticallAddress(
  client: Client.Client,
  options: {
    blockNumber?: bigint | undefined
    deployless?: boolean | undefined
  },
): Address.Address | null {
  const { blockNumber, deployless } = options
  if (deployless) return null
  if (!client.chain) return null
  // `getChainContractAddress` throws `ChainDoesNotSupportContract` when the
  // chain has no multicall3 deployment; fall back to a deployless multicall.
  try {
    return getChainContractAddress({
      blockNumber,
      chain: client.chain,
      contract: 'multicall3',
    })
  } catch {
    return null
  }
}

/** Whether a state override targets the given address. */
export function hasStateOverrideForAddress(
  stateOverride: StateOverrides.StateOverrides | undefined,
  address: Address.Address,
): boolean {
  if (!stateOverride) return false
  return Object.keys(stateOverride).some((stateOverrideAddress) =>
    Address.isEqual(stateOverrideAddress as Address.Address, address),
  )
}

let requestOptionsId = 0
const requestOptionsIds = new WeakMap<object, number>()
function getRequestOptionsId(
  requestOptions: RequestOptions,
): number | 'default' {
  if (!requestOptions) return 'default'
  const id = requestOptionsIds.get(requestOptions)
  if (id !== undefined) return id
  const nextId = requestOptionsId++
  requestOptionsIds.set(requestOptions, nextId)
  return nextId
}

/**
 * Schedules a call into a batched `aggregate3` multicall against the client's
 * multicall3 contract (or a deployless multicall when no address is available).
 */
export async function scheduleMulticall(
  client: Client.Client,
  options: scheduleMulticall.Options,
): Promise<{ data: Hex.Hex | undefined }> {
  const { batchSize = 1024, wait = 0 } =
    typeof client.batch?.multicall === 'object' ? client.batch.multicall : {}
  const { block, data, multicallAddress, requestOptions, stateOverride, to } =
    options

  const rpcStateOverride = stateOverride
    ? StateOverrides.toRpc(stateOverride)
    : undefined

  const stateOverrideKey = rpcStateOverride
    ? `.${JSON.stringify(rpcStateOverride)}`
    : ''

  const { schedule } = createBatchScheduler<
    { data: Hex.Hex; to: Address.Address },
    readonly { success: boolean; returnData: Hex.Hex }[]
  >({
    id: `${client.uid}.${block}.${getRequestOptionsId(requestOptions)}${stateOverrideKey}`,
    wait,
    shouldSplitBatch(args) {
      const size = args.reduce((size, { data }) => size + (data.length - 2), 0)
      return size > batchSize * 2
    },
    async fn(requests) {
      const calls = requests.map((request) => ({
        allowFailure: true,
        callData: request.data,
        target: request.to,
      }))

      const calldata = AbiFunction.encodeData(aggregate3Abi, [calls] as never)

      const multicallRequest =
        multicallAddress === null
          ? {
              data: toDeploylessCallViaBytecodeData({
                code: multicall3Bytecode,
                data: calldata,
              }),
            }
          : { to: multicallAddress, data: calldata }

      const response = await client.request(
        {
          method: 'eth_call',
          params: rpcStateOverride
            ? [multicallRequest, block, rpcStateOverride]
            : [multicallRequest, block],
        } as never,
        requestOptions,
      )

      return AbiFunction.decodeResult(aggregate3Abi, response as Hex.Hex, {
        as: 'Object',
      }) as readonly { success: boolean; returnData: Hex.Hex }[]
    },
  })

  const [{ returnData, success }] = await schedule({ data, to })

  if (!success) throw new MulticallCallFailedError(returnData)
  if (returnData === '0x') return { data: undefined }
  return { data: returnData }
}

export declare namespace scheduleMulticall {
  type Options = {
    /** Resolved rpc block selector for the multicall `eth_call` (tag or hex). */
    block: string
    /** Calldata to execute. */
    data: Hex.Hex
    /** Multicall3 address (`null` for deployless multicall). */
    multicallAddress: Address.Address | null
    /** Per-request transport options. */
    requestOptions?: RequestOptions
    /** State override to apply to the multicall. */
    stateOverride?: StateOverrides.StateOverrides | undefined
    /** Target address of the call. */
    to: Address.Address
  }

  type ErrorType = MulticallCallFailedError | Errors.GlobalErrorType
}

/** Thrown when an aggregated multicall sub-call reverts. */
export class MulticallCallFailedError extends BaseError {
  override readonly name = 'MulticallCallFailedError'

  /** Revert data returned by the failed sub-call. */
  readonly data: Hex.Hex

  constructor(data: Hex.Hex) {
    super('A call within the multicall aggregation failed.')
    this.data = data
  }
}
