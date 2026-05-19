import type * as Hex from 'ox/Hex'
import { describe, expect, test, vi } from 'vp/test'

import {
  type Client,
  type Request,
  type ResponseOptions,
  type Transport,
  createFilterRequestScope,
} from './filters.js'

const id = '0x1' as Hex.Hex

describe('createFilterRequestScope', () => {
  test('behavior: returns the client request for non-fallback transports', () => {
    const request = vi.fn(async () => '0x0')
    const client = {
      request,
      transport: {
        request,
        type: 'http',
      },
    } satisfies Client

    const getRequest = createFilterRequestScope(client, {
      method: 'eth_newBlockFilter',
    })

    expect(getRequest(id) === request).toMatchInlineSnapshot(`true`)
  })

  test('behavior: scopes fallback filter requests to the successful child transport', async () => {
    let onResponse: ((options: ResponseOptions) => void) | undefined
    const clientRequest = vi.fn(async () => '0x0')
    const childRequest = vi.fn(async () => ['0xabc'])
    const childTransport = transport({ request: childRequest })
    const client = {
      request: clientRequest,
      transport: transport({
        onResponse(fn) {
          onResponse = fn
        },
        request: clientRequest,
        type: 'fallback',
      }),
    } satisfies Client

    const getRequest = createFilterRequestScope(client, {
      method: 'eth_newBlockFilter',
    })
    onResponse?.({
      method: 'eth_newBlockFilter',
      response: id,
      status: 'success',
      transport: childTransport,
    })

    const request = getRequest(id)
    const result = await request({
      method: 'eth_getFilterChanges',
      params: [id],
    })

    expect({
      childCalls: childRequest.mock.calls,
      clientCalls: clientRequest.mock.calls,
      result,
    }).toMatchInlineSnapshot(`
      {
        "childCalls": [
          [
            {
              "method": "eth_getFilterChanges",
              "params": [
                "0x1",
              ],
            },
          ],
        ],
        "clientCalls": [],
        "result": [
          "0xabc",
        ],
      }
    `)
  })

  test('behavior: ignores failed and unrelated fallback responses', () => {
    let onResponse: ((options: ResponseOptions) => void) | undefined
    const clientRequest = vi.fn(async () => '0x0')
    const childRequest = vi.fn(async () => ['0xabc'])
    const childTransport = transport({ request: childRequest })
    const client = {
      request: clientRequest,
      transport: transport({
        onResponse(fn) {
          onResponse = fn
        },
        request: clientRequest,
        type: 'fallback',
      }),
    } satisfies Client

    const getRequest = createFilterRequestScope(client, {
      method: 'eth_newBlockFilter',
    })
    onResponse?.({
      method: 'eth_newBlockFilter',
      response: id,
      status: 'error',
      transport: childTransport,
    })
    onResponse?.({
      method: 'eth_newFilter',
      response: '0x2',
      status: 'success',
      transport: childTransport,
    })

    expect({
      failed: getRequest(id) === clientRequest,
      unrelated: getRequest('0x2') === clientRequest,
    }).toMatchInlineSnapshot(`
      {
        "failed": true,
        "unrelated": true,
      }
    `)
  })
})

function transport(
  options: Partial<Transport> & { request: Request },
): Transport {
  return options
}
