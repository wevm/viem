import * as Provider from 'ox/Provider'
import * as RpcResponse from 'ox/RpcResponse'
import { describe, expect, test, vi } from 'vp/test'

import { buildRequest, shouldRetry } from './buildRequest.js'
import { HttpRequestError } from './request.js'

describe('buildRequest', () => {
  test('behavior: forwards requests and signals', async () => {
    const request = vi.fn(async () => '0x1')
    const controller = new AbortController()
    const request_ = buildRequest(request)

    const result = await request_(
      { method: 'eth_blockNumber' },
      { signal: controller.signal },
    )

    expect({
      calls: request.mock.calls.map(([request, options]) => ({
        request,
        signal: options?.signal === controller.signal,
      })),
      result,
    }).toMatchInlineSnapshot(`
      {
        "calls": [
          {
            "request": {
              "method": "eth_blockNumber",
            },
            "signal": true,
          },
        ],
        "result": "0x1",
      }
    `)
  })

  test('behavior: blocks excluded methods before request', async () => {
    const request = vi.fn(async () => '0x1')
    const request_ = buildRequest(request, {
      methods: { exclude: ['eth_blockNumber'] },
    })

    await expect(() =>
      request_({ method: 'eth_blockNumber' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.MethodNotSupportedError: Method "eth_blockNumber" is not supported.]`,
    )
    expect(request).toHaveBeenCalledTimes(0)
  })

  test('behavior: blocks methods missing from include list', async () => {
    const request = vi.fn(async () => '0x1')
    const request_ = buildRequest(request, {
      methods: { include: ['eth_chainId'] },
    })

    await expect(() =>
      request_({ method: 'eth_blockNumber' }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[RpcResponse.MethodNotSupportedError: Method "eth_blockNumber" is not supported.]`,
    )
    expect(request).toHaveBeenCalledTimes(0)
  })

  test('behavior: aborts before request', async () => {
    const request = vi.fn(async () => '0x1')
    const controller = new AbortController()
    controller.abort(new Error('aborted'))
    const request_ = buildRequest(request)

    await expect(() =>
      request_({ method: 'eth_blockNumber' }, { signal: controller.signal }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: aborted]`)
    expect(request).toHaveBeenCalledTimes(0)
  })

  test('behavior: dedupes in-flight requests', async () => {
    const request = vi.fn(async () => '0x1')
    const request_ = buildRequest(request, { uid: 'test' })

    const results = await Promise.all([
      request_({ method: 'eth_blockNumber' }, { dedupe: true }),
      request_({ method: 'eth_blockNumber' }, { dedupe: true }),
      request_({ method: 'eth_chainId' }, { dedupe: true }),
    ])

    expect({
      calls: request.mock.calls.length,
      results,
    }).toMatchInlineSnapshot(`
      {
        "calls": 2,
        "results": [
          "0x1",
          "0x1",
          "0x1",
        ],
      }
    `)
  })

  test('behavior: parses rpc errors with Ox', async () => {
    const request_ = buildRequest(async () => {
      throw { code: 4001, message: 'rejected' }
    })

    await expect(() =>
      request_({ method: 'eth_requestAccounts' }, { retryCount: 0 }),
    ).rejects.toThrow(Provider.UserRejectedRequestError)
  })

  test('behavior: retries nondeterministic rpc errors', async () => {
    const request = vi
      .fn()
      .mockRejectedValueOnce({
        code: RpcResponse.InternalError.code,
        message: 'x',
      })
      .mockResolvedValue('0x1')
    const request_ = buildRequest(request, { retryCount: 1, retryDelay: 0 })

    const result = await request_({ method: 'eth_blockNumber' })

    expect({
      calls: request.mock.calls.length,
      result,
    }).toMatchInlineSnapshot(`
      {
        "calls": 2,
        "result": "0x1",
      }
    `)
  })
})

describe('shouldRetry', () => {
  test('behavior: retries nondeterministic rpc codes', () => {
    expect({
      internal: shouldRetry(
        new RpcResponse.InternalError({ message: 'internal' }),
      ),
      limit: shouldRetry(new RpcResponse.LimitExceededError()),
      parse: shouldRetry(new RpcResponse.ParseError()),
      tooManyRequests: shouldRetry(
        Object.assign(new Error('429'), { code: 429 }),
      ),
    }).toMatchInlineSnapshot(`
      {
        "internal": true,
        "limit": true,
        "parse": false,
        "tooManyRequests": true,
      }
    `)
  })

  test('behavior: retries nondeterministic http statuses', () => {
    expect({
      badRequest: shouldRetry(
        new HttpRequestError({
          status: 400,
          url: 'https://example.com',
        }),
      ),
      serverError: shouldRetry(
        new HttpRequestError({
          status: 500,
          url: 'https://example.com',
        }),
      ),
      tooManyRequests: shouldRetry(
        new HttpRequestError({
          status: 429,
          url: 'https://example.com',
        }),
      ),
    }).toMatchInlineSnapshot(`
      {
        "badRequest": false,
        "serverError": true,
        "tooManyRequests": true,
      }
    `)
  })
})
