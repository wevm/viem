import { AbiError, AbiParameters, Address, Hex } from 'ox'
import type { Errors } from 'ox'

import { getAbortError, isAbortError } from '../../internal/errors.js'
import * as CcipRead from '../../../utils/CcipRead.js'
import type * as Transport from '../../Transport.js'
import type { call } from '../call.js'
import {
  type Budget,
  charge,
  createBudget,
  localBatchGatewayRequest,
  localBatchGatewayUrl,
} from '../ens/internal/batchGateway.js'

type RequestOptions = NonNullable<call.Options['requestOptions']>

const maxLookupCount = 4

const offchainLookupAbiError = /*#__PURE__*/ AbiError.from(
  'error OffchainLookup(address sender, string[] urls, bytes callData, bytes4 callbackFunction, bytes extraData)',
)

const responseParameters = /*#__PURE__*/ AbiParameters.from('bytes, bytes')

/**
 * Resolves an [ERC-3668 `OffchainLookup`](https://eips.ethereum.org/EIPS/eip-3668)
 * revert: fetches the offchain result from the reverting contract's gateways
 * and re-executes the call through its callback function.
 *
 * Follows at most 4 nested callbacks. Every gateway request of the lookup,
 * including nested local batches, draws from one query and concurrency
 * budget, and uses the transport timeout.
 */
export async function offchainLookup(
  options: offchainLookup.Options,
): Promise<Hex.Hex | undefined> {
  const {
    blockNumber,
    blockTag,
    call,
    context: { budget = createBudget(), lookupCount = 0 } = {},
    data,
    request: request_,
    requestOptions,
    to,
    transport,
  } = options

  const timeout = transport ? getTransportTimeout(transport) : undefined
  const request: CcipRead.Request = (options) =>
    request_({
      ...options,
      requestOptions,
      ...(timeout !== undefined ? { timeout } : {}),
    })

  const [sender, urls, callData, callbackSelector, extraData] = AbiError.decode(
    offchainLookupAbiError,
    data,
  ) as [Address.Address, readonly string[], Hex.Hex, Hex.Hex, Hex.Hex]

  try {
    if (lookupCount >= maxLookupCount)
      throw new CcipRead.LookupLimitExceededError({
        limit: maxLookupCount,
      })
    if (!Address.isEqual(to, sender))
      throw new CcipRead.SenderMismatchError({ sender, to })

    const result = await (async () => {
      if (urls.includes(localBatchGatewayUrl))
        return localBatchGatewayRequest({ budget, data: callData, request })
      const urls_ = charge(budget, urls)
      return budget.run(() => request({ data: callData, sender, urls: urls_ }))
    })()

    const { data: response } = await call(
      {
        blockNumber,
        blockTag,
        data: Hex.concat(
          callbackSelector,
          AbiParameters.encode(responseParameters, [result, extraData]),
        ),
        requestOptions,
        to,
      } as call.Options,
      { budget, lookupCount: lookupCount + 1 },
    )

    return response
  } catch (err) {
    if (requestOptions?.signal?.aborted)
      throw getAbortError(requestOptions.signal)
    if (isAbortError(err)) throw err
    if (err instanceof CcipRead.LookupLimitExceededError) throw err

    throw new CcipRead.LookupError({
      callbackSelector,
      cause: err as Error,
      data,
      extraData,
      sender,
      urls,
    })
  }
}

export declare namespace offchainLookup {
  /** State shared by the nested callbacks of one lookup. */
  type Context = {
    /** Query and concurrency budget of the lookup. */
    budget?: Budget | undefined
    /** Completed lookup count. @default 0 */
    lookupCount?: number | undefined
  }

  type Options = {
    /** The block number the original call executed against. */
    blockNumber?: bigint | undefined
    /** The block tag the original call executed against. */
    blockTag?: string | undefined
    /**
     * Executes the callback call. A nested `OffchainLookup` revert resolves
     * with `context`.
     */
    call: (options: call.Options, context: Context) => Promise<call.ReturnType>
    /** State of the enclosing lookup, when this lookup is a callback's. */
    context?: Context | undefined
    /** The `OffchainLookup` revert data. */
    data: Hex.Hex
    /** Makes the offchain gateway request. */
    request: CcipRead.Request
    /** Per-request transport options. */
    requestOptions?: RequestOptions | undefined
    /** The contract that reverted with `OffchainLookup`. */
    to: Address.Address
    /** Transport whose timeout applies to each gateway request. */
    transport?: TimeoutTransport | undefined
  }

  type ErrorType =
    | AbiError.decode.ErrorType
    | CcipRead.LookupError
    | CcipRead.LookupLimitExceededError
    | Errors.GlobalErrorType
}

type TimeoutTransport = Pick<Transport.Instance, 'timeout'> & {
  transports?: readonly TimeoutTransport[] | undefined
}

/**
 * Returns the transport timeout. A wrapper that sets none (such as
 * `fallback`) uses the longest timeout of its transports, since any of them
 * may have served the call.
 */
function getTransportTimeout(transport: TimeoutTransport): number | undefined {
  if (transport.timeout !== undefined) return transport.timeout
  const timeouts = (transport.transports ?? [])
    .map(getTransportTimeout)
    .filter((timeout) => timeout !== undefined)
  return timeouts.length ? Math.max(...timeouts) : undefined
}
