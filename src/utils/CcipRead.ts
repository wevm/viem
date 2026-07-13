import { Hex } from 'ox'
import type { Address, Errors as OxErrors } from 'ox'

import * as Errors from '../core/Errors.js'
import type * as Transport from '../core/Transport.js'
import {
  getAbortError,
  getUrlOrigin,
  isAbortError,
} from '../core/internal/errors.js'
import * as RpcClient from './RpcClient.js'

type RequestOptions = Parameters<Transport.RequestFn>[1]
type GatewayResponse = {
  data?: unknown
}

/**
 * A function that requests CCIP data from gateway URLs.
 *
 * @example
 * ```ts
 * import { CcipRead } from 'viem/utils'
 *
 * const request: CcipRead.Request = CcipRead.request
 * ```
 */
export type Request = (options: request.Options) => Promise<request.ReturnType>

/**
 * Requests CCIP data from gateway URLs in order, returning the first valid
 * response. The built-in policy accepts standard-port HTTPS hostnames only
 * and does not follow redirects. Use a trusted proxy or allowlist when URLs
 * can be supplied by untrusted contracts.
 *
 * @example
 * ```ts
 * import { CcipRead } from 'viem/utils'
 *
 * const data = await CcipRead.request({
 *   data: '0xdeadbeef',
 *   sender: '0x0000000000000000000000000000000000000000',
 *   urls: ['https://example.com/{sender}/{data}'],
 * })
 * ```
 */
export async function request(
  options: request.Options,
): Promise<request.ReturnType> {
  const {
    allowUnsafeUrls = false,
    data,
    requestOptions,
    sender,
    urls,
  } = options

  let error = new Error('An unknown error occurred.')

  for (const url of urls) {
    if (requestOptions?.signal?.aborted)
      throw getAbortError(requestOptions.signal)

    const method = url.includes('{data}') ? 'GET' : 'POST'
    const body = method === 'POST' ? { data, sender } : undefined
    const headers: HeadersInit =
      method === 'POST' ? { 'Content-Type': 'application/json' } : {}
    const requestUrl = url
      .replace('{sender}', sender.toLowerCase())
      .replace('{data}', data)

    let parsedUrl: URL
    try {
      parsedUrl = parseUrl(requestUrl, { allowUnsafeUrls })
    } catch (err) {
      if (!(err instanceof UrlNotAllowedError)) throw err
      error = err
      continue
    }

    try {
      const response = await fetch(parsedUrl, {
        body: JSON.stringify(body),
        credentials: 'omit',
        headers,
        method,
        redirect: 'error',
        referrerPolicy: 'no-referrer',
        ...(requestOptions?.signal ? { signal: requestOptions.signal } : {}),
      })

      if (!response.ok) {
        await response.body?.cancel()
        error = new RpcClient.HttpError({
          body,
          status: response.status,
          url: getUrlOrigin(url),
        })
        continue
      }

      const isJson = response.headers
        .get('Content-Type')
        ?.startsWith('application/json')
      const payload = isJson ? await response.json() : await response.text()
      const gatewayResponse =
        isJson && payload && typeof payload === 'object'
          ? (payload as GatewayResponse)
          : undefined
      const result = isJson ? gatewayResponse?.data : payload

      if (!Hex.validate(result as string)) {
        error = new ResponseMalformedError({ url })
        continue
      }

      return result as Hex.Hex
    } catch (err) {
      if (requestOptions?.signal?.aborted)
        throw getAbortError(requestOptions.signal)
      if (isAbortError(err)) throw err

      error = new RpcClient.HttpError({
        body,
        url: getUrlOrigin(url),
      })
    }
  }

  throw error
}

export declare namespace request {
  type Options = {
    /** Allows URLs rejected by the built-in policy. Redirects and credentials remain disabled. @default false */
    allowUnsafeUrls?: boolean | undefined
    /** The call data to pass to the gateway. */
    data: Hex.Hex
    /** Per-request transport options. */
    requestOptions?: RequestOptions | undefined
    /** The address of the reverting contract. */
    sender: Address.Address
    /** Gateway URLs to try in order. */
    urls: readonly string[]
  }

  type ReturnType = Hex.Hex

  type ErrorType =
    | RpcClient.HttpError
    | ResponseMalformedError
    | UrlNotAllowedError
    | OxErrors.GlobalErrorType
}

function parseUrl(url: string, options: { allowUnsafeUrls: boolean }): URL {
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    throw new UrlNotAllowedError({ url })
  }

  if (parsedUrl.username || parsedUrl.password)
    throw new UrlNotAllowedError({ url })
  if (options.allowUnsafeUrls) return parsedUrl

  const hostname = parsedUrl.hostname.toLowerCase().replace(/\.$/u, '')
  if (
    parsedUrl.protocol !== 'https:' ||
    parsedUrl.port !== '' ||
    isIpLiteral(hostname) ||
    isLocalHostname(hostname)
  )
    throw new UrlNotAllowedError({ url })

  return parsedUrl
}

function isIpLiteral(hostname: string): boolean {
  return hostname.startsWith('[') || /^\d{1,3}(?:\.\d{1,3}){3}$/u.test(hostname)
}

function isLocalHostname(hostname: string): boolean {
  if (!hostname.includes('.')) return true
  return ['.internal', '.local', '.localdomain', '.localhost'].some((suffix) =>
    hostname.endsWith(suffix),
  )
}

/**
 * Routes CCIP requests through batch gateways.
 *
 * @example
 * ```ts
 * import { Client, http } from 'viem'
 * import { CcipRead } from 'viem/utils'
 *
 * const client = Client.create({
 *   ccipRead: CcipRead.tunnel({
 *     batchGateways: ['https://ccip-v3.ens.xyz'],
 *   }),
 *   transport: http(),
 * })
 * ```
 */
export function tunnel(options: tunnel.Options): tunnel.ReturnType {
  const { batchGateways } = options
  const request_ = options.request ?? request

  return {
    async request(options) {
      const { tunnelRequest } =
        await import('../core/actions/ens/internal/batchGateway.js')
      return await tunnelRequest({
        ...options,
        batchGateways,
        request: request_,
      })
    },
  }
}

export declare namespace tunnel {
  type Options = {
    /** Batch gateway URLs to route requests through. */
    batchGateways: readonly string[]
    /** Gateway request implementation. @default CcipRead.request */
    request?: Request | undefined
  }

  type ReturnType = {
    /** Makes a tunneled CCIP gateway request. */
    request: Request
  }
}

/**
 * Thrown when resolving an `OffchainLookup` revert fails.
 *
 * @example
 * ```ts
 * import { CcipRead } from 'viem/utils'
 *
 * if (error instanceof CcipRead.LookupError) console.error(error.cause)
 * ```
 */
export class LookupError extends Errors.BaseError<Error> {
  override readonly name = 'CcipRead.LookupError'

  constructor(options: {
    callbackSelector: Hex.Hex
    cause: Error
    data: Hex.Hex
    extraData: Hex.Hex
    sender: Address.Address
    urls: readonly string[]
  }) {
    const { callbackSelector, cause, data, extraData, sender, urls } = options
    const metaMessages =
      cause instanceof Errors.BaseError ? cause.metaMessages : []
    const shortMessage =
      cause instanceof Errors.BaseError ? cause.shortMessage : cause.message
    super(
      shortMessage ||
        'An error occurred while fetching for an offchain result.',
      {
        cause,
        metaMessages: [
          ...(metaMessages || []),
          metaMessages?.length ? '' : [],
          'Offchain Gateway Call:',
          [
            '  Gateway URL(s):',
            ...urls.map((url) => `    ${getUrlOrigin(url)}`),
          ],
          `  Sender: ${sender}`,
          `  Data: ${data}`,
          `  Callback selector: ${callbackSelector}`,
          `  Extra data: ${extraData}`,
        ].flat(),
      },
    )
  }
}

/**
 * Thrown when a CCIP gateway responds with a non-hex payload.
 *
 * @example
 * ```ts
 * import { CcipRead } from 'viem/utils'
 *
 * if (error instanceof CcipRead.ResponseMalformedError)
 *   console.error(error.message)
 * ```
 */
export class ResponseMalformedError extends Errors.BaseError {
  override readonly name = 'CcipRead.ResponseMalformedError'

  constructor(options: { url: string }) {
    const { url } = options
    super(
      'Offchain gateway response is malformed. Response data must be a hex value.',
      {
        metaMessages: [`Gateway URL: ${getUrlOrigin(url)}`],
      },
    )
  }
}

/**
 * Thrown when an `OffchainLookup` sender does not match the reverting contract.
 *
 * @example
 * ```ts
 * import { CcipRead } from 'viem/utils'
 *
 * if (error instanceof CcipRead.SenderMismatchError)
 *   console.error(error.message)
 * ```
 */
export class SenderMismatchError extends Errors.BaseError {
  override readonly name = 'CcipRead.SenderMismatchError'

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

/**
 * Thrown when a CCIP gateway URL is rejected by the built-in request policy.
 *
 * @example
 * ```ts
 * import { CcipRead } from 'viem/utils'
 *
 * if (error instanceof CcipRead.UrlNotAllowedError)
 *   console.error(error.message)
 * ```
 */
export class UrlNotAllowedError extends Errors.BaseError {
  override readonly name = 'CcipRead.UrlNotAllowedError'

  constructor(options: { url: string }) {
    const { url } = options
    super(
      'CCIP gateway URL is not allowed. Only standard-port HTTPS hostnames are permitted.',
      { metaMessages: [`Gateway URL: ${getUrlOrigin(url)}`] },
    )
  }
}
