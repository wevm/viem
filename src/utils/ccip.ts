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
  localBatchGatewayRequest,
  localBatchGatewayUrl,
} from './ens/localBatchGatewayRequest.js'
import { stringify } from './stringify.js'

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

  try {
    if (!isAddressEqual(to, sender))
      throw new OffchainLookupSenderMismatchError({ sender, to })

    const result = urls.includes(localBatchGatewayUrl)
      ? await localBatchGatewayRequest({
          data: callData,
          ccipRequest: (parameters) =>
            ccipRequest_({ ...parameters, requestOptions }),
        })
      : await ccipRequest_({ data: callData, requestOptions, sender, urls })

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
      requestOptions,
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
  urls: readonly string[]
}

export type CcipRequestReturnType = Hex

export type CcipRequestErrorType =
  | HttpRequestErrorType
  | OffchainLookupResponseMalformedErrorType
  | ErrorType

export async function ccipRequest({
  data,
  requestOptions,
  sender,
  urls,
}: CcipRequestParameters): Promise<CcipRequestReturnType> {
  let error = new Error('An unknown error occurred.')

  for (let i = 0; i < urls.length; i++) {
    if (requestOptions?.signal?.aborted)
      throw getAbortError(requestOptions.signal)

    const url = urls[i]
    const method = url.includes('{data}') ? 'GET' : 'POST'
    const body = method === 'POST' ? { data, sender } : undefined
    const headers: HeadersInit =
      method === 'POST' ? { 'Content-Type': 'application/json' } : {}
    const requestUrl = url
      .replace('{sender}', sender.toLowerCase())
      .replace('{data}', data)

    try {
      assertCcipRequestUrl(requestUrl)
    } catch (err) {
      error = err as Error
      continue
    }

    try {
      const response = await fetch(requestUrl, {
        body: JSON.stringify(body),
        headers,
        method,
        redirect: 'manual',
        ...(requestOptions?.signal ? { signal: requestOptions.signal } : {}),
      })

      let result: any
      if (
        response.headers.get('Content-Type')?.startsWith('application/json')
      ) {
        result = (await response.json()).data
      } else {
        result = (await response.text()) as any
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

      error = new HttpRequestError({
        body,
        details: (err as Error).message,
        url,
      })
    }
  }

  throw error
}

function assertCcipRequestUrl(url: string) {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new HttpRequestError({
      details: 'CCIP Read URL is invalid.',
      url,
    })
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new HttpRequestError({
      details:
        `CCIP Read request with scheme '${parsed.protocol.slice(0, -1)}' is not allowed. ` +
        'Only HTTP(S) URLs are permitted.',
      url,
    })
  }

  if (!parsed.hostname) {
    throw new HttpRequestError({
      details: 'CCIP Read URL has no hostname.',
      url,
    })
  }

  if (isBlockedCcipHostname(parsed.hostname)) {
    throw new HttpRequestError({
      details:
        `CCIP Read request to '${parsed.hostname}' is not allowed: ` +
        'host is in a blocked link-local or unspecified range.',
      url,
    })
  }
}

function isBlockedIpv4([a, b]: readonly number[]) {
  // 0.0.0.0/8 unspecified, 169.254.0.0/16 link-local / cloud metadata
  return a === 0 || (a === 169 && b === 254)
}

function parseIpv4Literal(host: string) {
  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host)
  if (!ipv4) return null
  const octets = ipv4.slice(1, 5).map(Number)
  if (octets.some((octet) => octet > 255)) return null
  return octets
}

/** Node keeps brackets on IPv6 `URL.hostname` and rewrites ::ffff:a.b.c.d to hex. */
function parseIpv4Mapped(host: string) {
  const dotted = /:ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/.exec(host)
  if (dotted) return parseIpv4Literal(dotted[1])

  const hex = /:ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(host)
  if (!hex) return null
  const hi = Number.parseInt(hex[1], 16)
  const lo = Number.parseInt(hex[2], 16)
  return [(hi >> 8) & 0xff, hi & 0xff, (lo >> 8) & 0xff, lo & 0xff]
}

function isBlockedCcipHostname(hostname: string) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '')

  const ipv4 = parseIpv4Literal(host)
  if (ipv4) return isBlockedIpv4(ipv4)

  const mapped = parseIpv4Mapped(host)
  if (mapped) return isBlockedIpv4(mapped)

  if (host === '::' || host === '0:0:0:0:0:0:0:0') return true
  // IPv6 link-local
  if (host === 'fe80' || host.startsWith('fe80:')) return true
  return false
}
