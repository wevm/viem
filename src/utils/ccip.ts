import type { Abi, Address } from 'abitype'

import {
  type CallParameters,
  call,
  getRevertErrorData,
} from '../actions/public/call.js'
import type { Client } from '../clients/createClient.js'
import type { Transport } from '../clients/transports/createTransport.js'
import type { BaseError } from '../errors/base.js'
import {
  OffchainLookupError,
  type OffchainLookupErrorType as OffchainLookupErrorType_,
  OffchainLookupResponseMalformedError,
  type OffchainLookupResponseMalformedErrorType,
  OffchainLookupSenderMismatchError,
} from '../errors/ccip.js'
import {
  HttpRequestError,
  type HttpRequestErrorType,
  ResponseBodyTooLargeError,
  type ResponseBodyTooLargeErrorType,
  TimeoutError,
  type TimeoutErrorType,
} from '../errors/request.js'
import { type ErrorType, getAbortError, isAbortError } from '../errors/utils.js'
import type { Chain } from '../types/chain.js'
import type { EIP1193RequestOptions } from '../types/eip1193.js'
import type { Hex } from '../types/misc.js'
import { decodeErrorResult } from './abi/decodeErrorResult.js'
import { encodeAbiParameters } from './abi/encodeAbiParameters.js'
import { isAddressEqual } from './address/isAddressEqual.js'
import { concat } from './data/concat.js'
import { isHex } from './data/isHex.js'
import {
  type CcipReadBudget,
  ccipReadLimit,
  createCcipReadBudget,
  localBatchGatewayRequest,
  localBatchGatewayUrl,
} from './ens/localBatchGatewayRequest.js'
import { anySignal, readResponseBody } from './internal/http.js'
import { withTimeout } from './promise/withTimeout.js'
import { stringify } from './stringify.js'

const ccipTimeout = 10_000
// Same ceiling as the HTTP transport.
const maxCcipResponseBytes = 10_485_760

export const offchainLookupSignature = '0x556f1830'
export const offchainLookupAbiItem = {
  name: 'OffchainLookup',
  type: 'error',
  inputs: [
    {
      name: 'sender',
      type: 'address',
    },
    {
      name: 'urls',
      type: 'string[]',
    },
    {
      name: 'callData',
      type: 'bytes',
    },
    {
      name: 'callbackFunction',
      type: 'bytes4',
    },
    {
      name: 'extraData',
      type: 'bytes',
    },
  ],
} as const satisfies Abi[number]

export type OffchainLookupErrorType = OffchainLookupErrorType_ | ErrorType

/**
 * Performs an EIP-3668 CCIP-Read lookup for a reverted `OffchainLookup` call.
 *
 * Follows at most 4 nested callbacks. Every gateway request of the lookup,
 * including nested local batches, draws from one query and concurrency budget.
 * Each gateway request uses the client transport timeout.
 */
export async function offchainLookup<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  {
    blockNumber,
    blockTag,
    budget = createCcipReadBudget(),
    data,
    depth = 0,
    requestOptions,
    to,
  }: Pick<CallParameters, 'blockNumber' | 'blockTag' | 'requestOptions'> & {
    /** Budget shared by the callbacks of one lookup. */
    budget?: CcipReadBudget | undefined
    data: Hex
    /** Callbacks already followed in this lookup. */
    depth?: number | undefined
    to: Address
  },
): Promise<Hex> {
  const { args } = decodeErrorResult({
    data,
    abi: [offchainLookupAbiItem],
  })
  const [sender, urls, callData, callbackSelector, extraData] = args

  const { ccipRead } = client
  const ccipRequest_ =
    ccipRead && typeof ccipRead?.request === 'function'
      ? ccipRead.request
      : ccipRequest
  const timeout = getTransportTimeout(client.transport)

  try {
    if (depth >= ccipReadLimit.depth)
      throw new HttpRequestError({
        details: `CCIP Read exceeded the maximum callback depth (${ccipReadLimit.depth}).`,
        url: urls[0] ?? '',
      })

    if (!isAddressEqual(to, sender))
      throw new OffchainLookupSenderMismatchError({ sender, to })

    const result = await (async () => {
      if (urls.includes(localBatchGatewayUrl))
        return localBatchGatewayRequest({
          budget,
          ccipRequest: (parameters) =>
            ccipRequest_({
              ...parameters,
              requestOptions,
              timeout: parameters.timeout ?? timeout,
            }),
          data: callData,
        })

      if (budget.queries <= 0)
        throw new HttpRequestError({
          details: `CCIP Read exceeded the maximum number of queries (${ccipReadLimit.queries}).`,
          url: urls[0] ?? '',
        })
      // Each URL is a gateway request, so each one draws from the budget.
      const urls_ = urls.slice(0, budget.queries)
      budget.queries -= Math.max(1, urls_.length)
      return budget.run(() =>
        ccipRequest_({
          data: callData,
          requestOptions,
          sender,
          timeout,
          urls: urls_,
        }),
      )
    })()

    const callbackData = concat([
      callbackSelector,
      encodeAbiParameters(
        [{ type: 'bytes' }, { type: 'bytes' }],
        [result, extraData],
      ),
    ])

    // The callback runs without CCIP-Read so a nested `OffchainLookup` comes
    // back here with the lookup's depth and budget.
    try {
      const { data: data_ } = await call({ ...client, ccipRead: false }, {
        blockNumber,
        blockTag,
        data: callbackData,
        requestOptions,
        to,
      } as CallParameters)
      return data_!
    } catch (err) {
      const revertData = getRevertErrorData(err)
      if (revertData?.slice(0, 10) !== offchainLookupSignature) throw err
      return await offchainLookup(client, {
        blockNumber,
        blockTag,
        budget,
        data: revertData,
        depth: depth + 1,
        requestOptions,
        to,
      })
    }
  } catch (err) {
    if (requestOptions?.signal?.aborted)
      throw getAbortError(requestOptions.signal)
    if (isAbortError(err)) throw err

    throw new OffchainLookupError({
      callbackSelector,
      cause: err as BaseError,
      data,
      extraData,
      sender,
      urls,
    })
  }
}

export type CcipRequestParameters = {
  data: Hex
  requestOptions?: EIP1193RequestOptions | undefined
  sender: Address
  /** The timeout (in ms) for each gateway request. Default: 10_000 */
  timeout?: number | undefined
  urls: readonly string[]
}

export type CcipRequestReturnType = Hex

export type CcipRequestErrorType =
  | HttpRequestErrorType
  | OffchainLookupResponseMalformedErrorType
  | ResponseBodyTooLargeErrorType
  | TimeoutErrorType
  | ErrorType

/**
 * Requests a CCIP-Read gateway result.
 *
 * Tries each HTTP(S) URL in order. Each request, including the response body,
 * times out after `timeout` (default 10 seconds) and reads at most 10 MiB.
 */
export async function ccipRequest({
  data,
  requestOptions,
  sender,
  timeout = ccipTimeout,
  urls,
}: CcipRequestParameters): Promise<CcipRequestReturnType> {
  let error = new Error('An unknown error occurred.')

  for (const url of urls) {
    if (requestOptions?.signal?.aborted)
      throw getAbortError(requestOptions.signal)

    const requestUrl = url
      .replace('{sender}', sender.toLowerCase())
      .replace('{data}', data)
    const method = url.includes('{data}') ? 'GET' : 'POST'
    const body = method === 'POST' ? { data, sender } : undefined
    const headers: HeadersInit =
      method === 'POST' ? { 'Content-Type': 'application/json' } : {}

    try {
      assertCcipUrl(requestUrl)

      const { response, responseBody } = await withTimeout(
        async ({ signal: timeoutSignal }) => {
          // Abort on whichever fires first so that a `signal` does not
          // disable the timeout.
          const { signal, cleanup } = anySignal([
            requestOptions?.signal,
            timeout > 0 ? timeoutSignal : null,
          ])
          try {
            const response = await fetch(requestUrl, {
              body: JSON.stringify(body),
              headers,
              method,
              ...(signal ? { signal } : {}),
            })
            // Read the body within the timeout too, so a response that stalls
            // after its headers cannot hang the request.
            const responseBody = await readResponseBody(response, {
              maxResponseBodySize: maxCcipResponseBytes,
            })
            return { response, responseBody }
          } finally {
            cleanup()
          }
        },
        {
          errorInstance: new TimeoutError({
            body: body ?? { data, sender },
            url,
          }),
          signal: true,
          timeout,
        },
      )

      let result: any
      if (
        response.headers.get('Content-Type')?.startsWith('application/json')
      ) {
        result = JSON.parse(responseBody).data
      } else {
        result = responseBody
      }

      if (!response.ok) {
        error = new HttpRequestError({
          body,
          details: result?.error
            ? stringify(result.error)
            : response.statusText,
          headers: response.headers,
          status: response.status,
          url,
        })
        continue
      }

      if (!isHex(result)) {
        error = new OffchainLookupResponseMalformedError({
          result,
          url,
        })
        continue
      }

      return result
    } catch (err) {
      if (requestOptions?.signal?.aborted)
        throw getAbortError(requestOptions.signal)
      if (isAbortError(err)) throw err
      if (
        err instanceof HttpRequestError ||
        err instanceof TimeoutError ||
        err instanceof ResponseBodyTooLargeError
      ) {
        error = err
        continue
      }

      error = new HttpRequestError({
        body,
        cause: err as Error,
        url,
      })
    }
  }

  throw error
}

function assertCcipUrl(url: string) {
  const parsed = (() => {
    try {
      return new URL(url)
    } catch {
      throw new HttpRequestError({
        details: 'CCIP Read URL is invalid.',
        url,
      })
    }
  })()

  if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return
  throw new HttpRequestError({
    details: `CCIP Read URL scheme "${parsed.protocol.slice(0, -1)}" is not allowed.`,
    url,
  })
}

type TimeoutTransport = {
  config?: { timeout?: number | undefined } | undefined
  timeout?: number | undefined
  transports?: readonly TimeoutTransport[] | undefined
  value?: { transports?: readonly TimeoutTransport[] | undefined } | undefined
}

/**
 * Returns the transport timeout. A wrapper that sets none (such as
 * `fallback`) uses the longest timeout of its transports, since any of them
 * may have served the call.
 */
function getTransportTimeout(transport: TimeoutTransport): number | undefined {
  const timeout = transport.timeout ?? transport.config?.timeout
  if (timeout !== undefined) return timeout
  const timeouts = (transport.transports ?? transport.value?.transports ?? [])
    .map(getTransportTimeout)
    .filter((timeout) => timeout !== undefined)
  return timeouts.length ? Math.max(...timeouts) : undefined
}
