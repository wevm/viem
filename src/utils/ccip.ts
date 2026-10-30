import type { Abi, Address } from 'abitype'

import { type CallParameters, call } from '../actions/public/call.js'
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
  ccipReadLimit,
  localBatchGatewayRequest,
  localBatchGatewayUrl,
} from './ens/localBatchGatewayRequest.js'
import { withTimeout } from './promise/withTimeout.js'
import { stringify } from './stringify.js'

const ccipTimeout = 10_000
// Same ceiling as the HTTP transport.
const maxCcipResponseBytes = 10_485_760

const ccipDepths = new WeakMap<object, number>()

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
 * Follows at most 4 nested callbacks. A nested local batch shares that depth.
 */
export async function offchainLookup<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  {
    blockNumber,
    blockTag,
    data,
    requestOptions,
    to,
  }: Pick<CallParameters, 'blockNumber' | 'blockTag' | 'requestOptions'> & {
    data: Hex
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

  const depth = requestOptions ? (ccipDepths.get(requestOptions) ?? 0) : 0

  try {
    if (depth >= ccipReadLimit.depth)
      throw new HttpRequestError({
        details: `CCIP Read exceeded the maximum callback depth (${ccipReadLimit.depth}).`,
        url: urls[0] ?? '',
      })

    if (!isAddressEqual(to, sender))
      throw new OffchainLookupSenderMismatchError({ sender, to })

    const result = urls.includes(localBatchGatewayUrl)
      ? await localBatchGatewayRequest({
          data: callData,
          ccipRequest: (parameters) =>
            ccipRequest_({ ...parameters, requestOptions }),
        })
      : await ccipRequest_({ data: callData, requestOptions, sender, urls })

    // Passed into the callback `call`, so a nested lookup sees the next depth.
    const requestOptions_ = { ...requestOptions }
    ccipDepths.set(requestOptions_, depth + 1)

    const { data: data_ } = await call(client, {
      blockNumber,
      blockTag,
      data: concat([
        callbackSelector,
        encodeAbiParameters(
          [{ type: 'bytes' }, { type: 'bytes' }],
          [result, extraData],
        ),
      ]),
      requestOptions: requestOptions_,
      to,
    } as CallParameters)

    return data_!
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

/**
 * Returns a signal that aborts as soon as any of `signals` aborts, and a
 * `cleanup` function that detaches the listeners added to `signals`.
 */
function anySignal(signals: readonly (AbortSignal | null | undefined)[]) {
  const signals_ = signals.filter((signal) => !!signal)
  if (signals_.length < 2)
    return { signal: signals_[0] ?? null, cleanup: () => {} }

  const controller = new AbortController()
  const onAbort = () => {
    cleanup()
    controller.abort(signals_.find((signal) => signal.aborted)?.reason)
  }
  const cleanup = () => {
    for (const signal of signals_) signal.removeEventListener('abort', onAbort)
  }

  for (const signal of signals_) {
    if (signal.aborted) {
      cleanup()
      controller.abort(signal.reason)
      break
    }
    signal.addEventListener('abort', onAbort)
  }

  return { signal: controller.signal, cleanup }
}

async function readResponseBody(
  response: Response,
  { maxResponseBodySize }: { maxResponseBodySize: number },
) {
  const contentLength = response.headers.get('Content-Length')
  if (contentLength) {
    const size = Number(contentLength)
    if (size > maxResponseBodySize) {
      await response.body?.cancel()
      throw new ResponseBodyTooLargeError({
        maxSize: maxResponseBodySize,
        size,
      })
    }
  }

  if (!response.body) {
    const body = await response.text()
    const size = new TextEncoder().encode(body).length
    if (size > maxResponseBodySize)
      throw new ResponseBodyTooLargeError({
        maxSize: maxResponseBodySize,
        size,
      })
    return body
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let body = ''
  let size = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > maxResponseBodySize) {
        await reader.cancel()
        throw new ResponseBodyTooLargeError({
          maxSize: maxResponseBodySize,
          size,
        })
      }
      body += decoder.decode(value, { stream: true })
    }
    body += decoder.decode()
    return body
  } finally {
    reader.releaseLock()
  }
}
