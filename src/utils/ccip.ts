import type { Abi, Address } from 'abitype'

import { type CallParameters, call } from '../actions/public/call.js'
import type { PublicClient } from '../clients/createPublicClient.js'
import type { Transport } from '../clients/transports/createTransport.js'
import { type BaseError } from '../errors/base.js'
import {
  OffchainLookupError,
  OffchainLookupResponseMalformedError,
  OffchainLookupSenderMismatchError,
} from '../errors/ccip.js'
import { HttpRequestError } from '../errors/request.js'
import type { Chain } from '../types/chain.js'
import type { GetErrorArgs } from '../types/contract.js'
import type { Hex } from '../types/misc.js'

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

export async function offchainLookup<TChain extends Chain | undefined>(
  client: PublicClient<Transport, TChain>,
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
  }) as unknown as GetErrorArgs<
    [typeof offchainLookupAbiItem],
    'OffchainLookup'
  >
  const [sender, urls, callData, callbackSelector, extraData] = args

  try {
    if (!isAddressEqual(to, sender))
      throw new OffchainLookupSenderMismatchError({ sender, to })

    const result = await ccipFetch({ data: callData, sender, urls })

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

export async function ccipFetch({
  data,
  sender,
  urls,
}: { data: Hex; sender: Address; urls: readonly string[] }) {
  let error = new Error('An unknown error occurred.')

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    const method =
      url.includes('{sender}') || url.includes('{data}') ? 'GET' : 'POST'
    const body = method === 'POST' ? { data, sender } : undefined

    try {
      const response = await fetch(
        url.replace('{sender}', sender).replace('{data}', data),
        {
          body: JSON.stringify(body),
          method,
        },
      )

      let result
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
          details: stringify(result.error) || response.statusText,
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
