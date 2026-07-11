import type { IncomingMessage } from 'node:http'
import { AbiError, AbiFunction } from 'ox'
import type { Address, Hex } from 'ox'
import { createBatchGatewayErrorServer } from '~test/ens.js'
import { createServer } from '~test/http.js'
import { describe, expect, test } from 'vitest'

import { CcipRead, RpcClient } from 'viem'

import { localBatchGatewayUrl } from '../core/actions/ens/internal/batchGateway.js'

const sender = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
const query = AbiFunction.from(
  'function query((address sender, string[] urls, bytes data)[] queries) view returns (bool[] failures, bytes[] responses)',
)
const solidityError = AbiError.from('error Error(string message)')
const panicError = AbiError.from('error Panic(uint256 reason)')

type GetRequest = {
  method: string | undefined
  url: string | undefined
}

type PostRequest = {
  body: string
  contentType: string | undefined
  method: string | undefined
}

type BatchRequestBody = {
  data: Hex.Hex
  sender: Address.Address
}

type BatchQuery = {
  data: Hex.Hex
  sender: Address.Address
  urls: readonly string[]
}

type BatchRequest = {
  outerSender: Address.Address
  queries: readonly BatchQuery[]
}

async function readBody(request: IncomingMessage) {
  let body = ''
  for await (const chunk of request) body += chunk.toString()
  return body
}

function createResultServer(data: Hex.Hex) {
  return createServer((_request, response) => {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ data }))
  })
}

function encodeBatchResult(failures: boolean[], responses: Hex.Hex[]) {
  return AbiFunction.encodeResult(query, [failures, responses])
}

function requestUnsafe(options: CcipRead.request.Options) {
  return CcipRead.request({ ...options, allowUnsafeUrls: true })
}

function getErrorText(error: Error) {
  const error_ = error as Error & {
    details?: string | undefined
    metaMessages?: readonly string[] | undefined
  }
  return [
    error_.message,
    error_.stack,
    error_.details,
    ...(error_.metaMessages ?? []),
  ].join('\n')
}

describe('request', () => {
  test.each([
    ['HTTP', 'http://example.com/{data}'],
    ['file', 'file:///etc/passwd'],
    ['data', 'data:application/json,{"data":"0xdeadbeef"}'],
    ['malformed', 'not a URL'],
    ['credentials', 'https://user:password@example.com'],
    ['IPv4', 'https://8.8.8.8'],
    ['IPv4 shorthand', 'https://127.1'],
    ['IPv4 integer', 'https://2130706433'],
    ['IPv4 hexadecimal', 'https://0x7f000001'],
    ['IPv4 octal', 'https://0177.0.0.1'],
    ['IPv6', 'https://[2606:4700:4700::1111]'],
    ['IPv4-mapped IPv6', 'https://[::ffff:7f00:1]'],
    ['localhost', 'https://localhost'],
    ['localhost with a trailing dot', 'https://localhost.'],
    ['localhost subdomain', 'https://gateway.localhost'],
    ['localhost subdomain with a trailing dot', 'https://gateway.localhost.'],
    ['mDNS hostname', 'https://gateway.local'],
    ['mDNS hostname with a trailing dot', 'https://gateway.local.'],
    ['internal hostname', 'https://gateway.internal'],
    ['internal hostname with a trailing dot', 'https://gateway.internal.'],
    ['non-default port', 'https://example.com:8443'],
  ])('policy: rejects %s URLs', async (_name, url) => {
    const error = await CcipRead.request({
      data: '0xdeadbeef',
      sender,
      urls: [url],
    }).catch((error) => error)

    expect(error).toBeInstanceOf(CcipRead.UrlNotAllowedError)
    expect(error).toMatchObject({ name: 'CcipRead.UrlNotAllowedError' })
  })

  test('options: allowUnsafeUrls permits data URLs', async () => {
    await expect(
      requestUnsafe({
        data: '0xdeadbeef',
        sender,
        urls: ['data:application/json,{"data":"0xcafebabe"}'],
      }),
    ).resolves.toMatchInlineSnapshot(`"0xcafebabe"`)
  })

  test('options: allowUnsafeUrls keeps credentials disabled', async () => {
    const error = await requestUnsafe({
      data: '0xdeadbeef',
      sender,
      urls: ['https://user:password@example.com'],
    }).catch((error) => error)

    expect(error).toBeInstanceOf(CcipRead.UrlNotAllowedError)
  })

  test('default: GET substitutes sender and data', async () => {
    let received: GetRequest | undefined
    const server = await createServer((request, response) => {
      received = { method: request.method, url: request.url }
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ data: '0xdeadbeef' }))
    })

    try {
      const result = await requestUnsafe({
        data: '0xdeadbeef',
        sender,
        urls: [`${server.url}/{sender}/{data}`],
      })

      expect({ received, result }).toMatchInlineSnapshot(`
        {
          "received": {
            "method": "GET",
            "url": "/0xd8da6bf26964af9d7eed9e03e53415d37aa96045/0xdeadbeef",
          },
          "result": "0xdeadbeef",
        }
      `)
    } finally {
      await server.close()
    }
  })

  test('behavior: text response', async () => {
    const server = await createServer((_request, response) => {
      response.end('0xcafebabe')
    })

    try {
      await expect(
        requestUnsafe({
          data: '0xdeadbeef',
          sender,
          urls: [`${server.url}/{sender}/{data}`],
        }),
      ).resolves.toMatchInlineSnapshot(`"0xcafebabe"`)
    } finally {
      await server.close()
    }
  })

  test('behavior: POST sends a JSON body', async () => {
    let received: PostRequest | undefined
    const server = await createServer(async (request, response) => {
      received = {
        body: await readBody(request),
        contentType: request.headers['content-type'],
        method: request.method,
      }
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ data: '0xcafebabe' }))
    })

    try {
      const result = await requestUnsafe({
        data: '0xdeadbeef',
        sender,
        urls: [server.url],
      })

      expect({ received, result }).toMatchInlineSnapshot(`
        {
          "received": {
            "body": "{"data":"0xdeadbeef","sender":"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"}",
            "contentType": "application/json",
            "method": "POST",
          },
          "result": "0xcafebabe",
        }
      `)
    } finally {
      await server.close()
    }
  })

  test('behavior: falls through failed and malformed gateways', async () => {
    const failing = await createServer((_request, response) => {
      response.writeHead(500)
      response.end()
    })
    const malformed = await createServer((_request, response) => {
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ data: 'not hex' }))
    })
    const succeeding = await createServer((_request, response) => {
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ data: '0xcafebabe' }))
    })

    try {
      await expect(
        requestUnsafe({
          data: '0xdeadbeef',
          sender,
          urls: [failing.url, malformed.url, succeeding.url],
        }),
      ).resolves.toMatchInlineSnapshot(`"0xcafebabe"`)
    } finally {
      await Promise.all([
        failing.close(),
        malformed.close(),
        succeeding.close(),
      ])
    }
  })

  test('behavior: rejects redirects when unsafe URLs are allowed', async () => {
    const target = await createServer((_request, response) => {
      response.end('0xcafebabe')
    })
    const redirect = await createServer((_request, response) => {
      response.writeHead(302, { Location: `${target.url}/{data}` })
      response.end()
    })

    try {
      const error = await requestUnsafe({
        data: '0xdeadbeef',
        sender,
        urls: [`${redirect.url}/{data}`],
      }).catch((error) => error)

      expect(error).toBeInstanceOf(RpcClient.HttpError)
      expect(error).toMatchObject({ name: 'RpcClient.HttpError' })
    } finally {
      await Promise.all([redirect.close(), target.close()])
    }
  })

  test('error: HTTP response', async () => {
    const server = await createServer((_request, response) => {
      response.writeHead(500, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ message: 'gateway unavailable' }))
    })

    try {
      const error = (await requestUnsafe({
        data: '0xdeadbeef',
        sender,
        urls: [`${server.url}/{sender}/{data}?apiKey=INTERNAL_GATEWAY_SECRET`],
      }).catch((error) => error)) as RpcClient.HttpError

      expect(error).toBeInstanceOf(RpcClient.HttpError)
      expect(getErrorText(error)).not.toContain('gateway unavailable')
      expect(getErrorText(error)).not.toContain('INTERNAL_GATEWAY_SECRET')
      expect({
        body: error.body,
        name: error.name,
        status: error.status,
        url: error.url.replace(server.url, 'http://localhost'),
      }).toMatchInlineSnapshot(`
        {
          "body": undefined,
          "name": "RpcClient.HttpError",
          "status": 500,
          "url": "http://localhost",
        }
      `)
    } finally {
      await server.close()
    }
  })

  test('error: alternate JSON error field', async () => {
    const server = await createServer((_request, response) => {
      response.writeHead(500, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ error: { code: 'unavailable' } }))
    })

    try {
      const error = (await requestUnsafe({
        data: '0xdeadbeef',
        sender,
        urls: [server.url],
      }).catch((error) => error)) as RpcClient.HttpError

      expect(getErrorText(error)).not.toContain('unavailable')
    } finally {
      await server.close()
    }
  })

  test('error: malformed response', async () => {
    const server = await createServer((_request, response) => {
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ data: 'not hex' }))
    })

    try {
      const error = (await requestUnsafe({
        data: '0xdeadbeef',
        sender,
        urls: [`${server.url}/{sender}/{data}`],
      }).catch((error) => error)) as CcipRead.ResponseMalformedError

      expect(error).toBeInstanceOf(CcipRead.ResponseMalformedError)
      expect(getErrorText(error)).not.toContain('not hex')
      expect({
        name: error.name,
        shortMessage: error.shortMessage,
      }).toMatchInlineSnapshot(`
        {
          "name": "CcipRead.ResponseMalformedError",
          "shortMessage": "Offchain gateway response is malformed. Response data must be a hex value.",
        }
      `)
    } finally {
      await server.close()
    }
  })

  test.each([
    {
      body: 'INTERNAL_METADATA_TOKEN=viem-ssrf-proof',
      contentType: 'text/plain',
      name: 'text',
      status: 200,
    },
    {
      body: JSON.stringify({
        data: 'INTERNAL_METADATA_TOKEN=viem-ssrf-proof',
      }),
      contentType: 'application/json',
      name: 'JSON',
      status: 200,
    },
    {
      body: 'viem-ssrf-proof',
      contentType: 'application/json',
      name: 'invalid JSON',
      status: 200,
    },
    {
      body: JSON.stringify({
        message: 'INTERNAL_METADATA_TOKEN=viem-ssrf-proof',
      }),
      contentType: 'application/json',
      name: 'HTTP error',
      status: 500,
    },
  ])('error: redacts $name response bodies', async (fixture) => {
    const server = await createServer((_request, response) => {
      response.statusMessage = 'viem-ssrf-proof'
      response.writeHead(fixture.status, {
        'Content-Type': fixture.contentType,
        'X-Internal-Secret': 'viem-ssrf-proof',
      })
      response.end(fixture.body)
    })

    try {
      const gatewayUrl = `${server.url}/{data}?apiKey=INTERNAL_GATEWAY_SECRET`
      const error = (await requestUnsafe({
        data: '0xdeadbeef',
        sender,
        urls: [gatewayUrl],
      }).catch((error) => error)) as Error
      const lookupError = new CcipRead.LookupError({
        callbackSelector: '0xcafebabe',
        cause: error,
        data: '0xdeadbeef',
        extraData: '0x',
        sender,
        urls: [gatewayUrl],
      })

      expect(error).toBeInstanceOf(Error)
      expect(getErrorText(error)).not.toContain('viem-ssrf-proof')
      expect(getErrorText(lookupError)).not.toContain('viem-ssrf-proof')
      expect(getErrorText(lookupError.cause)).not.toContain('viem-ssrf-proof')
      expect(getErrorText(error)).not.toContain('INTERNAL_GATEWAY_SECRET')
      expect(getErrorText(lookupError)).not.toContain('INTERNAL_GATEWAY_SECRET')
      expect(JSON.stringify(error)).not.toContain('viem-ssrf-proof')
      expect(JSON.stringify(lookupError)).not.toContain('viem-ssrf-proof')
      expect(JSON.stringify(error)).not.toContain('INTERNAL_GATEWAY_SECRET')
      expect(JSON.stringify(lookupError)).not.toContain(
        'INTERNAL_GATEWAY_SECRET',
      )
    } finally {
      await server.close()
    }
  })

  test('error: fetch failure', async () => {
    const error = (await requestUnsafe({
      data: '0xdeadbeef',
      sender,
      urls: ['http://127.0.0.1:1'],
    }).catch((error) => error)) as RpcClient.HttpError

    expect(error).toBeInstanceOf(RpcClient.HttpError)
    expect({
      body: error.body,
      name: error.name,
      url: error.url,
    }).toMatchInlineSnapshot(`
      {
        "body": {
          "data": "0xdeadbeef",
          "sender": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        },
        "name": "RpcClient.HttpError",
        "url": "http://127.0.0.1:1",
      }
    `)
  })

  test('error: no gateways', async () => {
    await expect(
      requestUnsafe({ data: '0xdeadbeef', sender, urls: [] }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: An unknown error occurred.]`,
    )
  })

  test('requestOptions: already-aborted signal', async () => {
    const controller = new AbortController()
    controller.abort()

    const error = await requestUnsafe({
      data: '0xdeadbeef',
      requestOptions: { signal: controller.signal },
      sender,
      urls: ['fakeurl'],
    }).catch((error) => error)

    expect(error).toMatchObject({ name: 'AbortError' })
  })

  test('requestOptions: aborts an in-flight request', async () => {
    const server = await createServer(async (_request, response) => {
      await new Promise((resolve) => setTimeout(resolve, 100))
      response.end(JSON.stringify({ data: '0xcafebabe' }))
    })
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 20)

    try {
      const error = await requestUnsafe({
        data: '0xdeadbeef',
        requestOptions: { signal: controller.signal },
        sender,
        urls: [`${server.url}/{sender}/{data}`],
      }).catch((error) => error)

      expect(error).toMatchObject({ name: 'AbortError' })
    } finally {
      await server.close()
    }
  })
})

describe('tunnel', () => {
  test('behavior: passes local batch requests through', async () => {
    let received: Pick<PostRequest, 'body' | 'method'> | undefined
    const server = await createServer(async (request, response) => {
      received = {
        body: await readBody(request),
        method: request.method,
      }
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify({ data: '0xdeadbeef' }))
    })
    const tunnel = CcipRead.tunnel({ batchGateways: [server.url] })

    try {
      const result = await tunnel.request({
        allowUnsafeUrls: true,
        data: '0xcafebabe',
        sender,
        urls: [localBatchGatewayUrl],
      })

      expect({ received, result }).toMatchInlineSnapshot(`
        {
          "received": {
            "body": "{"data":"0xcafebabe","sender":"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"}",
            "method": "POST",
          },
          "result": "0xdeadbeef",
        }
      `)
    } finally {
      await server.close()
    }
  })

  test('behavior: encodes a hosted batch query', async () => {
    let received: BatchRequest | undefined
    const server = await createServer(async (request, response) => {
      const body = JSON.parse(await readBody(request)) as BatchRequestBody
      const [queries] = AbiFunction.decodeData(query, body.data)
      received = { outerSender: body.sender, queries }
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(
        JSON.stringify({
          data: encodeBatchResult([false], ['0xdeadbeef']),
        }),
      )
    })
    const tunnel = CcipRead.tunnel({
      batchGateways: [server.url],
      request: requestUnsafe,
    })

    try {
      const result = await tunnel.request({
        data: '0xcafebabe',
        sender,
        urls: ['https://example.com/{sender}/{data}'],
      })

      expect({ received, result }).toMatchInlineSnapshot(`
        {
          "received": {
            "outerSender": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
            "queries": [
              {
                "data": "0xcafebabe",
                "sender": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
                "urls": [
                  "https://example.com/{sender}/{data}",
                ],
              },
            ],
          },
          "result": "0xdeadbeef",
        }
      `)
    } finally {
      await server.close()
    }
  })

  test('options: request uses a real adapter', async () => {
    const server = await createResultServer(
      encodeBatchResult([false], ['0xdeadbeef']),
    )
    const tunnel = CcipRead.tunnel({
      batchGateways: ['fakeurl'],
      request(options) {
        return requestUnsafe({ ...options, urls: [server.url] })
      },
    })

    try {
      await expect(
        tunnel.request({
          data: '0xcafebabe',
          sender,
          urls: ['https://example.com/{sender}/{data}'],
        }),
      ).resolves.toMatchInlineSnapshot(`"0xdeadbeef"`)
    } finally {
      await server.close()
    }
  })

  test.each([
    ['local passthrough', [localBatchGatewayUrl]],
    ['hosted query', ['https://example.com/{sender}/{data}']],
  ])(
    'requestOptions: forwards an aborted signal for %s',
    async (_name, urls) => {
      const controller = new AbortController()
      controller.abort()
      const tunnel = CcipRead.tunnel({
        batchGateways: ['fakeurl'],
        request: requestUnsafe,
      })

      const error = await tunnel
        .request({
          data: '0xcafebabe',
          requestOptions: { signal: controller.signal },
          sender,
          urls,
        })
        .catch((error) => error)

      expect(error).toMatchObject({ name: 'AbortError' })
    },
  )

  test('error: redacts an HTTP error', async () => {
    const server = await createBatchGatewayErrorServer()
    const batchGatewayUrl = `${server.url}/gateway?apiKey=INTERNAL_GATEWAY_SECRET`
    const tunnel = CcipRead.tunnel({
      batchGateways: [batchGatewayUrl],
      request: requestUnsafe,
    })

    try {
      const error = (await tunnel
        .request({
          data: '0xcafebabe',
          sender,
          urls: ['https://a.example', 'https://b.example'],
        })
        .catch((error) => error)) as RpcClient.HttpError

      expect(error).toBeInstanceOf(RpcClient.HttpError)
      expect(getErrorText(error)).not.toContain('Not Found')
      expect(getErrorText(error)).not.toContain('INTERNAL_GATEWAY_SECRET')
      expect({
        body: error.body,
        name: error.name,
        status: error.status,
        url: error.url.replace(server.url, 'http://localhost'),
      }).toMatchInlineSnapshot(`
        {
          "body": undefined,
          "name": "RpcClient.HttpError",
          "status": 404,
          "url": "http://localhost",
        }
      `)
    } finally {
      await server.close()
    }
  })

  test('error: redacts a Solidity error', async () => {
    const server = await createResultServer(
      encodeBatchResult(
        [true],
        [AbiError.encode(solidityError, ['Gateway failed.'])],
      ),
    )
    const tunnel = CcipRead.tunnel({
      batchGateways: [server.url],
      request: requestUnsafe,
    })

    try {
      await expect(
        tunnel.request({
          data: '0xcafebabe',
          sender,
          urls: ['https://example.com'],
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: CCIP batch gateway request failed.]`,
      )
    } finally {
      await server.close()
    }
  })

  test('error: redacts a Solidity panic', async () => {
    const server = await createResultServer(
      encodeBatchResult([true], [AbiError.encode(panicError, [17n])]),
    )
    const tunnel = CcipRead.tunnel({
      batchGateways: [server.url],
      request: requestUnsafe,
    })

    try {
      await expect(
        tunnel.request({
          data: '0xcafebabe',
          sender,
          urls: ['https://example.com'],
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: CCIP batch gateway request failed.]`,
      )
    } finally {
      await server.close()
    }
  })

  test('error: empty Solidity error message', async () => {
    const server = await createResultServer(
      encodeBatchResult([true], [AbiError.encode(solidityError, [''])]),
    )
    const tunnel = CcipRead.tunnel({
      batchGateways: [server.url],
      request: requestUnsafe,
    })

    try {
      await expect(
        tunnel.request({
          data: '0xcafebabe',
          sender,
          urls: ['https://example.com'],
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: CCIP batch gateway request failed.]`,
      )
    } finally {
      await server.close()
    }
  })

  test('error: malformed failure response', async () => {
    const server = await createResultServer(
      encodeBatchResult([true], ['0xdeadbeef']),
    )
    const tunnel = CcipRead.tunnel({
      batchGateways: [server.url],
      request: requestUnsafe,
    })

    try {
      await expect(
        tunnel.request({
          data: '0xcafebabe',
          sender,
          urls: ['https://example.com'],
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: CCIP batch gateway request failed.]`,
      )
    } finally {
      await server.close()
    }
  })

  test('error: missing batch response', async () => {
    const server = await createResultServer(encodeBatchResult([], []))
    const tunnel = CcipRead.tunnel({
      batchGateways: [server.url],
      request: requestUnsafe,
    })

    try {
      await expect(
        tunnel.request({
          data: '0xcafebabe',
          sender,
          urls: ['https://example.com'],
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[Error: An unknown error occurred.]`,
      )
    } finally {
      await server.close()
    }
  })
})

describe('LookupError', () => {
  test('accepts plain Error causes', () => {
    const error = new CcipRead.LookupError({
      callbackSelector: '0xcafebabe',
      cause: new Error('Gateway failed.'),
      data: '0xdeadbeef',
      extraData: '0x',
      sender,
      urls: ['https://example.com'],
    })

    expect({
      cause: error.cause.name,
      name: error.name,
      shortMessage: error.shortMessage,
    }).toMatchInlineSnapshot(`
        {
          "cause": "Error",
          "name": "CcipRead.LookupError",
          "shortMessage": "Gateway failed.",
        }
      `)
  })
})
