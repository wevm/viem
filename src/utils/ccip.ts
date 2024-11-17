import type { Abi, Address } from 'abitype'

import { type CallParameters, call } from '../actions/public/call.js'
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
import type { Chain } from '../types/chain.js'
import type { Hex } from '../types/misc.js'

import type { Client } from '../clients/createClient.js'
import type { ErrorType } from '../errors/utils.js'
import { decodeErrorResult } from './abi/decodeErrorResult.js'
import { encodeAbiParameters } from './abi/encodeAbiParameters.js'
import { isAddressEqual } from './address/isAddressEqual.js'
import { concat } from './data/concat.js'
import { isHex } from './data/isHex.js'
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
    to,
  }: Pick<CallParameters, 'blockNumber' | 'blockTag'> & {
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

    const result = await ccipRequest_({ data: callData, sender, urls })

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
      to,
    } as CallParameters)

    return data_!
  } catch (err) {
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
  sender,
  urls,
}: CcipRequestParameters): Promise<CcipRequestReturnType> {
  let error = new Error('An unknown error occurred.')

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    const method = url.includes('{data}') ? 'GET' : 'POST'
    const body = method === 'POST' ? { data, sender } : undefined
    const headers: HeadersInit =
      method === 'POST' ? { 'Content-Type': 'application/json' } : {}

    try {
      const response = await fetch(
        url.replace('{sender}', sender).replace('{data}', data),
        {
          body: JSON.stringify(body),
          headers,
          method,
        },
      )

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
      error = new HttpRequestError({
        body,
        details: (err as Error).message,
        url,
      })
    }
  }

  throw error
}
