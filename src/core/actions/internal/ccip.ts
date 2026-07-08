import { AbiError, AbiParameters, Address, Hex } from 'ox'
import type { Errors } from 'ox'

import type * as Client from '../../Client.js'
import { BaseError } from '../../Errors.js'
import { getAbortError, getUrl, isAbortError } from '../../internal/errors.js'
import * as Json from '../../../utils/Json.js'
import { HttpError } from '../../../utils/RpcClient.js'
import { call } from '../call.js'
import {
  localBatchGatewayRequest,
  localBatchGatewayUrl,
} from '../ens/internal/batchGateway.js'

type RequestOptions = Parameters<Client.Client['request']>[1]

export const offchainLookupSignature = '0x556f1830'

export const offchainLookupAbiError = /*#__PURE__*/ AbiError.from(
  'error OffchainLookup(address sender, string[] urls, bytes callData, bytes4 callbackFunction, bytes extraData)',
)

const responseParameters = /*#__PURE__*/ AbiParameters.from('bytes, bytes')

/**
 * Resolves an [ERC-3668 `OffchainLookup`](https://eips.ethereum.org/EIPS/eip-3668)
 * revert: fetches the offchain result from the reverting contract's gateways
 * and re-executes the call through its callback function.
 */
export async function offchainLookup(
  client: Client.Client,
  options: offchainLookup.Options,
): Promise<Hex.Hex> {
  const { blockNumber, blockTag, data, requestOptions, to } = options

  const [sender, urls, callData, callbackSelector, extraData] = AbiError.decode(
    offchainLookupAbiError,
    data,
  ) as [Address.Address, readonly string[], Hex.Hex, Hex.Hex, Hex.Hex]

  const { ccipRead } = client
  const request =
    ccipRead && typeof ccipRead.request === 'function'
      ? ccipRead.request
      : ccipRequest

  try {
    if (!Address.isEqual(to, sender))
      throw new OffchainLookupSenderMismatchError({ sender, to })

    const result = urls.includes(localBatchGatewayUrl)
      ? await localBatchGatewayRequest({
          ccipRequest: (parameters) =>
            request({ ...parameters, requestOptions }),
          data: callData,
        })
      : await request({ data: callData, requestOptions, sender, urls })

    const { data: response } = await call(client, {
      blockNumber,
      blockTag,
      data: Hex.concat(
        callbackSelector,
        AbiParameters.encode(responseParameters, [result, extraData]),
      ),
      requestOptions,
      to,
    } as call.Options)

    return response!
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

export declare namespace offchainLookup {
  type Options = {
    /** The block number the original call executed against. */
    blockNumber?: bigint | undefined
    /** The block tag the original call executed against. */
    blockTag?: string | undefined
    /** The `OffchainLookup` revert data. */
    data: Hex.Hex
    /** Per-request transport options. */
    requestOptions?: RequestOptions
    /** The contract that reverted with `OffchainLookup`. */
    to: Address.Address
  }

  type ErrorType =
    | OffchainLookupError
    | OffchainLookupSenderMismatchError
    | Errors.GlobalErrorType
}

/**
 * Performs an offchain CCIP lookup request against a list of gateway URLs,
 * returning the first successful hex response.
 */
export async function ccipRequest(
  options: ccipRequest.Options,
): Promise<Hex.Hex> {
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
        ? ((await response.json()) as { data?: unknown; error?: unknown }).data
        : await response.text()

      if (!response.ok) {
        error = new HttpError({
          body,
          details:
            result && typeof result === 'object' && 'error' in result
              ? Json.stringify((result as { error: unknown }).error)
              : response.statusText,
          headers: response.headers,
          status: response.status,
          url,
        })
        continue
      }

      if (!Hex.validate(result as string)) {
        error = new OffchainLookupResponseMalformedError({ result, url })
        continue
      }

      return result as Hex.Hex
    } catch (err) {
      if (requestOptions?.signal?.aborted)
        throw getAbortError(requestOptions.signal)
      if (isAbortError(err)) throw err

      error = new HttpError({
        body,
        details: (err as Error).message,
        url,
      })
    }
  }

  throw error
}

export declare namespace ccipRequest {
  type Options = {
    /** The call data to pass to the gateway. */
    data: Hex.Hex
    /** Per-request transport options. */
    requestOptions?: RequestOptions
    /** The address of the reverting contract. */
    sender: Address.Address
    /** Gateway URLs to try in order. */
    urls: readonly string[]
  }

  type ErrorType =
    | HttpError
    | OffchainLookupResponseMalformedError
    | Errors.GlobalErrorType
}

/** Thrown when resolving an `OffchainLookup` revert fails. */
export class OffchainLookupError extends BaseError<BaseError> {
  override readonly name = 'OffchainLookupError'

  constructor(options: {
    callbackSelector: Hex.Hex
    cause: BaseError
    data: Hex.Hex
    extraData: Hex.Hex
    sender: Address.Address
    urls: readonly string[]
  }) {
    const { callbackSelector, cause, data, extraData, sender, urls } = options
    super(
      cause.shortMessage ||
        'An error occurred while fetching for an offchain result.',
      {
        cause,
        metaMessages: [
          ...(cause.metaMessages || []),
          cause.metaMessages?.length ? '' : [],
          'Offchain Gateway Call:',
          ['  Gateway URL(s):', ...urls.map((url) => `    ${getUrl(url)}`)],
          `  Sender: ${sender}`,
          `  Data: ${data}`,
          `  Callback selector: ${callbackSelector}`,
          `  Extra data: ${extraData}`,
        ].flat(),
      },
    )
  }
}

/** Thrown when an offchain gateway responds with a non-hex payload. */
export class OffchainLookupResponseMalformedError extends BaseError {
  override readonly name = 'OffchainLookupResponseMalformedError'

  constructor(options: { result: unknown; url: string }) {
    const { result, url } = options
    super(
      'Offchain gateway response is malformed. Response data must be a hex value.',
      {
        metaMessages: [
          `Gateway URL: ${getUrl(url)}`,
          `Response: ${Json.stringify(result)}`,
        ],
      },
    )
  }
}

/** Thrown when the `OffchainLookup` sender does not match the reverting contract. */
export class OffchainLookupSenderMismatchError extends BaseError {
  override readonly name = 'OffchainLookupSenderMismatchError'

  constructor(options: { sender: Address.Address; to: Address.Address }) {
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
