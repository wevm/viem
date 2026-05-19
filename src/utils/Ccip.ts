import type * as Address from 'ox/Address'
import * as ox_AbiError from 'ox/AbiError'
import * as ox_AbiFunction from 'ox/AbiFunction'
import * as Hex from 'ox/Hex'

import { BaseError } from '../core/BaseError.js'
import { getAbortError, getUrl, isAbortError } from '../core/internal/errors.js'
import { HttpRequestError } from '../core/internal/request.js'
import { stringify } from '../core/internal/stringify.js'

const localBatchGatewayUrl = 'x-batch-gateway:true'

/**
 * Selector for the `OffchainLookup` error.
 */
export const offchainLookupSignature = '0x556f1830'

/**
 * ABI item for the `OffchainLookup` error.
 */
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
} as const satisfies ox_AbiError.AbiError

const batchGatewayAbi = [
  {
    name: 'query',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      {
        type: 'tuple[]',
        name: 'queries',
        components: [
          {
            type: 'address',
            name: 'sender',
          },
          {
            type: 'string[]',
            name: 'urls',
          },
          {
            type: 'bytes',
            name: 'data',
          },
        ],
      },
    ],
    outputs: [
      {
        type: 'bool[]',
        name: 'failures',
      },
      {
        type: 'bytes[]',
        name: 'responses',
      },
    ],
  },
  {
    name: 'HttpError',
    type: 'error',
    inputs: [
      {
        type: 'uint16',
        name: 'status',
      },
      {
        type: 'string',
        name: 'message',
      },
    ],
  },
] as const

const solidityError = {
  inputs: [
    {
      name: 'message',
      type: 'string',
    },
  ],
  name: 'Error',
  type: 'error',
} as const satisfies ox_AbiError.AbiError

/**
 * Performs an EIP-3668 CCIP-read gateway request.
 *
 * Tries each gateway URL until a valid hex response is returned.
 *
 * @example
 * ```ts twoslash
 * import { Ccip } from 'viem/utils'
 *
 * const data = await Ccip.request({
 *   data: '0xdeadbeef',
 *   sender: '0x0000000000000000000000000000000000000000',
 *   urls: ['https://example.com/{sender}/{data}'],
 * })
 * ```
 *
 * @param options - Request options.
 * @returns The CCIP-read response data.
 */
export async function request(
  options: request.Options,
): Promise<request.ReturnType> {
  const { data, requestOptions, sender, urls } = options
  let error = new Error('An unknown error occurred.')

  for (const url of urls) {
    if (requestOptions?.signal?.aborted)
      throw getAbortError(requestOptions.signal)

    const method = url.includes('{data}') ? 'GET' : 'POST'
    const body = method === 'POST' ? { data, sender } : undefined
    const headers: HeadersInit =
      method === 'POST' ? { 'Content-Type': 'application/json' } : {}

    try {
      const response = await fetch(
        url.replace('{sender}', sender.toLowerCase()).replace('{data}', data),
        {
          body: JSON.stringify(body),
          headers,
          method,
          ...(requestOptions?.signal ? { signal: requestOptions.signal } : {}),
        },
      )

      const result = response.headers
        .get('Content-Type')
        ?.startsWith('application/json')
        ? (await response.json()).data
        : await response.text()

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

      if (!Hex.validate(result, { strict: true })) {
        error = new ResponseMalformedError({ result, url })
        continue
      }

      return result
    } catch (error_) {
      if (requestOptions?.signal?.aborted)
        throw getAbortError(requestOptions.signal)
      if (isAbortError(error_)) throw error_

      error = new HttpRequestError({
        body,
        details: (error_ as Error).message,
        url,
      })
    }
  }

  throw error
}

export declare namespace request {
  /** Options for {@link request}. */
  type Options = {
    /** Calldata to send to the gateway. */
    data: Hex.Hex
    /** Request options. */
    requestOptions?: RequestOptions | undefined
    /** Contract address that emitted `OffchainLookup`. */
    sender: Address.Address
    /** Gateway URLs. */
    urls: readonly string[]
  }

  /** Return type for {@link request}. */
  type ReturnType = Hex.Hex

  /** Error type for {@link request}. */
  type ErrorType =
    | HttpRequestError
    | ResponseMalformedError
    | import('../core/internal/errors.js').AbortErrorType
}

/**
 * Request options for CCIP-read gateway requests.
 */
export type RequestOptions = {
  /** Abort signal. */
  signal?: AbortSignal | undefined
}

/**
 * Creates a CCIP-read tunnel through batch gateways.
 *
 * @example
 * ```ts twoslash
 * import { Ccip } from 'viem/utils'
 *
 * const ccipRead = Ccip.createTunnel({
 *   batchGateways: ['https://ccip-v3.ens.xyz'],
 * })
 * ```
 *
 * @param options - Tunnel options.
 * @returns A CCIP-read request object.
 */
export function createTunnel(
  options: createTunnel.Options,
): createTunnel.ReturnType {
  const { batchGateways, request: request_ = request } = options

  return {
    async request(options) {
      const { data, requestOptions, sender, urls } = options
      if (urls.includes(localBatchGatewayUrl))
        return request_({
          data,
          requestOptions,
          sender,
          urls: batchGateways,
        })

      const [failures, responses] = ox_AbiFunction.decodeResult(
        batchGatewayAbi,
        'query',
        await request_({
          data: ox_AbiFunction.encodeData(batchGatewayAbi, 'query', [
            [{ data, sender, urls }],
          ]),
          requestOptions,
          sender,
          urls: batchGateways,
        }),
      ) as [readonly boolean[], readonly Hex.Hex[]]

      const response = responses[0]
      if (!response) throw new Error('An unknown error occurred.')
      if (!failures[0]) return response

      throw parseBatchGatewayError({ response, urls })
    },
  }
}

export declare namespace createTunnel {
  /** Options for {@link createTunnel}. */
  type Options = {
    /** Batch gateway URLs. */
    batchGateways: readonly string[]
    /** CCIP-read gateway request function. */
    request?: typeof request | undefined
  }

  /** Return type for {@link createTunnel}. */
  type ReturnType = {
    /** Performs a CCIP-read request. */
    request: typeof request
  }
}

/**
 * Error thrown when an offchain lookup fails.
 */
export class OffchainLookupError<
  cause extends Error = Error,
> extends BaseError<cause> {
  override readonly name = 'Ccip.OffchainLookupError'

  constructor(options: OffchainLookupError.Options<cause>) {
    const { callbackSelector, cause, data, extraData, sender, urls } = options
    const shortMessage =
      'shortMessage' in cause && typeof cause.shortMessage === 'string'
        ? cause.shortMessage
        : 'An error occurred while fetching for an offchain result.'
    const metaMessages =
      'metaMessages' in cause && Array.isArray(cause.metaMessages)
        ? cause.metaMessages
        : []
    super(shortMessage, {
      cause,
      metaMessages: [
        ...metaMessages,
        metaMessages.length ? '' : [],
        'Offchain Gateway Call:',
        urls && [
          '  Gateway URL(s):',
          ...urls.map((url) => `    ${getUrl(url)}`),
        ],
        `  Sender: ${sender}`,
        `  Data: ${data}`,
        `  Callback selector: ${callbackSelector}`,
        `  Extra data: ${extraData}`,
      ].flat(),
    })
  }
}

export declare namespace OffchainLookupError {
  /** Options for {@link OffchainLookupError}. */
  type Options<cause extends Error = Error> = {
    /** Callback selector. */
    callbackSelector: Hex.Hex
    /** Error cause. */
    cause: cause
    /** Offchain lookup revert data. */
    data: Hex.Hex
    /** Extra callback data. */
    extraData: Hex.Hex
    /** Offchain lookup sender. */
    sender: Address.Address
    /** Gateway URLs. */
    urls: readonly string[]
  }
}

/**
 * Error thrown when a gateway returns malformed response data.
 */
export class ResponseMalformedError extends BaseError {
  override readonly name = 'Ccip.ResponseMalformedError'

  constructor(options: ResponseMalformedError.Options) {
    const { result, url } = options
    super(
      'Offchain gateway response is malformed. Response data must be a hex value.',
      {
        metaMessages: [
          `Gateway URL: ${getUrl(url)}`,
          `Response: ${stringify(result)}`,
        ],
      },
    )
  }
}

export declare namespace ResponseMalformedError {
  /** Options for {@link ResponseMalformedError}. */
  type Options = {
    /** Gateway response. */
    result: unknown
    /** Gateway URL. */
    url: string
  }
}

/**
 * Error thrown when `OffchainLookup.sender` does not match the call target.
 */
export class SenderMismatchError extends BaseError {
  override readonly name = 'Ccip.SenderMismatchError'

  constructor(options: SenderMismatchError.Options) {
    const { sender, to } = options
    super(
      'Reverted sender address does not match target contract address (`to`).',
      {
        metaMessages: [
          `Contract address: ${to}`,
          `OffchainLookup sender address: ${sender}`,
        ],
      },
    )
  }
}

export declare namespace SenderMismatchError {
  /** Options for {@link SenderMismatchError}. */
  type Options = {
    /** Offchain lookup sender. */
    sender: Address.Address
    /** Target contract address. */
    to: Address.Address
  }
}

function parseBatchGatewayError(options: {
  response: Hex.Hex
  urls: readonly string[]
}) {
  try {
    const { args, error } = ox_AbiError.extract(
      [...batchGatewayAbi, solidityError],
      options.response,
    )
    if (error.name === 'HttpError') {
      const [status, message] = args as [number, string]
      return new HttpRequestError({
        body: { message },
        status,
        url: options.urls.join(' | '),
      })
    }
    const [message] = args as [string]
    if (message) return new Error(message)
  } catch {}
  return new Error('An unknown error occurred.')
}
