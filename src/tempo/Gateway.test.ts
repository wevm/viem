import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { createRequestListener } from '@remix-run/node-fetch-server'
import { Actions, createClient, Gateway, gatewayActions } from 'viem/tempo'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

type Entry = {
  expiresAt: number | null
  key: string
  value: unknown
  version: number
}
type StoredObject = {
  bytes: ArrayBuffer
  contentType: string
  expiresAt: number
}

const objects = new Map<string, StoredObject>()
const entries = new Map<string, Entry>()

function problem(status: number, code: string, detail: string) {
  return Response.json(
    { code, detail, status },
    { headers: { 'content-type': 'application/problem+json' }, status },
  )
}

function metadata(key: string, object: StoredObject) {
  return {
    contentType: object.contentType,
    etag: `"${object.bytes.byteLength}"`,
    expiresAt: object.expiresAt,
    key,
    size: object.bytes.byteLength,
    uploadedAt: 0,
  }
}

async function handle(request: Request) {
  const { pathname } = new URL(request.url)
  if (pathname === '/v1/capabilities')
    return Response.json({ chainId: 4217, version: '2026-10-22' })

  const app = request.headers.get('gateway-app')
  if (!app) return problem(400, 'invalid_request', 'Gateway-App is required.')
  if (request.headers.get('authorization') !== 'Payment test')
    return problem(402, 'payment_required', 'Payment is required.')
  const scope = (key: string) => `${app}/${key}`

  if (pathname === '/v1/bucket/put') {
    const bytes = await request.arrayBuffer()
    if (bytes.byteLength !== Number(request.headers.get('gateway-size')))
      return problem(400, 'invalid_request', 'Gateway-Size does not match.')
    const key = request.headers.get('gateway-key') ?? ''
    const object = {
      bytes,
      contentType: request.headers.get('content-type') ?? '',
      expiresAt: Number(request.headers.get('gateway-retention')) * 1000,
    }
    objects.set(scope(key), object)
    return Response.json(metadata(key, object))
  }

  const body = (await request.json()) as {
    ifVersion?: number | null
    key: string
    prefix?: string
    value?: unknown
  }

  switch (pathname) {
    case '/v1/ai/embed':
      return Response.json({ embeddings: [[0.5, 0.25]], shape: [1, 2] })
    case '/v1/ai/generate':
      return Response.json({
        text: JSON.stringify(body),
        usage: { completion_tokens: 2, prompt_tokens: 1, total_tokens: 3 },
      })
    case '/v1/bucket/delete':
      return Response.json({ deleted: objects.delete(scope(body.key)) })
    case '/v1/bucket/get': {
      const object = objects.get(scope(body.key))
      if (!object)
        return problem(404, 'not_found', `${body.key} does not exist.`)
      return new Response(object.bytes, {
        headers: {
          'content-type': object.contentType,
          'gateway-expires-at': String(object.expiresAt),
          etag: `"${object.bytes.byteLength}"`,
        },
      })
    }
    case '/v1/bucket/head': {
      const object = objects.get(scope(body.key))
      return Response.json(object ? metadata(body.key, object) : null)
    }
    case '/v1/bucket/list':
      return Response.json({
        cursor: null,
        objects: [...objects]
          .filter(([key]) => key.startsWith(scope(body.prefix ?? '')))
          .map(([key, object]) =>
            metadata(key.slice(scope('').length), object),
          ),
      })
    case '/v1/kv/delete':
      return Response.json({ deleted: entries.delete(scope(body.key)) })
    case '/v1/kv/get':
      return Response.json(entries.get(scope(body.key)) ?? null)
    case '/v1/kv/list':
      return Response.json({
        cursor: null,
        entries: [...entries]
          .filter(([key]) => key.startsWith(scope(body.prefix ?? '')))
          .map(([, entry]) => entry),
      })
    case '/v1/kv/set': {
      const current = entries.get(scope(body.key))
      if (
        body.ifVersion !== undefined &&
        (current?.version ?? null) !== body.ifVersion
      )
        return problem(
          409,
          'version_conflict',
          `${body.key} does not match ifVersion.`,
        )
      const entry = {
        expiresAt: null,
        key: body.key,
        value: body.value,
        version: (current?.version ?? 0) + 1,
      }
      entries.set(scope(body.key), entry)
      return Response.json(entry)
    }
  }
  return problem(404, 'not_found', 'Route not found.')
}

const server = createServer(createRequestListener(handle))
let url = ''

beforeAll(async () => {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
})

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve))
})

function paidFetch(input: string, init: RequestInit) {
  const headers = new Headers(init.headers)
  headers.set('authorization', 'Payment test')
  return fetch(input, { ...init, headers })
}

describe('from', () => {
  test('default', () => {
    const { fetch: _, ...gateway } = Gateway.from({
      app: 'my-app',
      url: 'https://gateway.example.com/',
    })

    expect(gateway).toMatchInlineSnapshot(`
      {
        "app": "my-app",
        "url": "https://gateway.example.com",
      }
    `)
  })

  test('behavior: invalid app', () => {
    expect(() =>
      Gateway.from({ app: 'My App', url: 'https://gateway.example.com' }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [Gateway.InvalidAppError: App "My App" is not a valid Gateway app namespace.

      Use 1 to 63 lowercase letters, digits, or hyphens.

      Version: viem@x.y.z]
    `)
  })
})

test('getCapabilities', async () => {
  const gateway = Gateway.from({ app: 'my-app', url })

  expect(await Gateway.getCapabilities(gateway)).toMatchInlineSnapshot(`
    {
      "chainId": 4217,
      "version": "2026-10-22",
    }
  `)
})

describe('request', () => {
  test('behavior: payment required', async () => {
    const gateway = Gateway.from({ app: 'my-app', url })

    const error = await Actions.kv
      .get(gateway, { key: 'counter' })
      .catch((error) => error)

    expect(error).toBeInstanceOf(Gateway.PaymentRequiredError)
    expect(error.code).toMatchInlineSnapshot(`"payment_required"`)
    expect(error.status).toMatchInlineSnapshot(`402`)
  })

  test('behavior: problem', async () => {
    const gateway = Gateway.from({ app: 'my-app', fetch: paidFetch, url })

    const error = await Gateway.request(gateway, {
      body: '{}',
      path: '/missing',
    }).catch((error) => error)

    expect(error).toBeInstanceOf(Gateway.RequestError)
    const { code, detail, name, status } = error
    expect({ code, detail, name, status }).toMatchInlineSnapshot(`
      {
        "code": "not_found",
        "detail": "Route not found.",
        "name": "Gateway.RequestError",
        "status": 404,
      }
    `)
  })
})

describe('ai', () => {
  test('embed', async () => {
    const gateway = Gateway.from({ app: 'ai', fetch: paidFetch, url })

    expect(
      await Actions.ai.embed(gateway, {
        input: 'hello',
        model: '@cf/baai/bge-base-en-v1.5',
      }),
    ).toMatchInlineSnapshot(`
      {
        "embeddings": [
          [
            0.5,
            0.25,
          ],
        ],
        "shape": [
          1,
          2,
        ],
      }
    `)
  })

  test('generateText', async () => {
    const gateway = Gateway.from({ app: 'ai', fetch: paidFetch, url })

    expect(
      await Actions.ai.generateText(gateway, {
        maxOutputTokens: 16,
        model: '@cf/meta/llama-3.1-8b-instruct',
        prompt: 'hello',
      }),
    ).toMatchInlineSnapshot(`
      {
        "text": "{"maxOutputTokens":16,"model":"@cf/meta/llama-3.1-8b-instruct","prompt":"hello"}",
        "usage": {
          "inputTokens": 1,
          "outputTokens": 2,
          "totalTokens": 3,
        },
      }
    `)
  })
})

describe('bucket', () => {
  test('default', async () => {
    const gateway = Gateway.from({ app: 'bucket', fetch: paidFetch, url })

    const written = await Actions.bucket.put(gateway, {
      key: 'notes/today.txt',
      retention: 60,
      value: new Blob(['héllo'], { type: 'text/plain' }),
    })
    const object = await Actions.bucket.get(gateway, { key: 'notes/today.txt' })
    const text = object ? await new Response(object.body).text() : null
    const head = await Actions.bucket.head(gateway, { key: 'notes/today.txt' })
    const listed = await Actions.bucket.list(gateway, { prefix: 'notes/' })
    const deleted = await Actions.bucket.delete(gateway, {
      key: 'notes/today.txt',
    })
    const missing = await Actions.bucket.get(gateway, {
      key: 'notes/today.txt',
    })

    expect({
      deleted,
      head,
      listed,
      missing,
      text,
      written,
    }).toMatchInlineSnapshot(`
      {
        "deleted": {
          "deleted": true,
        },
        "head": {
          "contentType": "text/plain",
          "etag": ""6"",
          "expiresAt": 60000,
          "key": "notes/today.txt",
          "size": 6,
          "uploadedAt": 0,
        },
        "listed": {
          "cursor": null,
          "objects": [
            {
              "contentType": "text/plain",
              "etag": ""6"",
              "expiresAt": 60000,
              "key": "notes/today.txt",
              "size": 6,
              "uploadedAt": 0,
            },
          ],
        },
        "missing": null,
        "text": "héllo",
        "written": {
          "contentType": "text/plain",
          "etag": ""6"",
          "expiresAt": 60000,
          "key": "notes/today.txt",
          "size": 6,
          "uploadedAt": 0,
        },
      }
    `)
  })

  test('behavior: value types', async () => {
    const gateway = Gateway.from({ app: 'bucket', fetch: paidFetch, url })

    const results = await Promise.all([
      Actions.bucket.put(gateway, {
        key: 'string',
        retention: 60,
        value: 'héllo',
      }),
      Actions.bucket.put(gateway, {
        key: 'bytes',
        retention: 60,
        value: new Uint8Array([1, 2, 3]),
      }),
      Actions.bucket.put(gateway, {
        contentType: 'application/json',
        key: 'buffer',
        retention: 60,
        value: new Uint8Array([123, 125]).buffer,
      }),
    ])

    expect(results).toMatchInlineSnapshot(`
      [
        {
          "contentType": "text/plain;charset=utf-8",
          "etag": ""6"",
          "expiresAt": 60000,
          "key": "string",
          "size": 6,
          "uploadedAt": 0,
        },
        {
          "contentType": "application/octet-stream",
          "etag": ""3"",
          "expiresAt": 60000,
          "key": "bytes",
          "size": 3,
          "uploadedAt": 0,
        },
        {
          "contentType": "application/json",
          "etag": ""2"",
          "expiresAt": 60000,
          "key": "buffer",
          "size": 2,
          "uploadedAt": 0,
        },
      ]
    `)
  })
})

describe('kv', () => {
  test('default', async () => {
    const gateway = Gateway.from({ app: 'kv', fetch: paidFetch, url })

    const created = await Actions.kv.set(gateway, {
      ifVersion: null,
      key: 'counter',
      value: { count: 1 },
    })
    const updated = await Actions.kv.set(gateway, {
      ifVersion: 1,
      key: 'counter',
      value: { count: 2 },
    })
    const read = await Actions.kv.get(gateway, { key: 'counter' })
    const listed = await Actions.kv.list(gateway)
    const deleted = await Actions.kv.delete(gateway, { key: 'counter' })
    const missing = await Actions.kv.get(gateway, { key: 'counter' })

    expect({
      created,
      deleted,
      listed,
      missing,
      read,
      updated,
    }).toMatchInlineSnapshot(`
      {
        "created": {
          "expiresAt": null,
          "key": "counter",
          "value": {
            "count": 1,
          },
          "version": 1,
        },
        "deleted": {
          "deleted": true,
        },
        "listed": {
          "cursor": null,
          "entries": [
            {
              "expiresAt": null,
              "key": "counter",
              "value": {
                "count": 2,
              },
              "version": 2,
            },
          ],
        },
        "missing": null,
        "read": {
          "expiresAt": null,
          "key": "counter",
          "value": {
            "count": 2,
          },
          "version": 2,
        },
        "updated": {
          "expiresAt": null,
          "key": "counter",
          "value": {
            "count": 2,
          },
          "version": 2,
        },
      }
    `)
  })

  test('behavior: version conflict', async () => {
    const gateway = Gateway.from({ app: 'kv', fetch: paidFetch, url })

    await Actions.kv.set(gateway, { key: 'conflict', value: 1 })

    await expect(
      Actions.kv.set(gateway, { ifVersion: null, key: 'conflict', value: 2 }),
    ).rejects.toThrowError(Gateway.VersionConflictError)
  })
})

describe('gatewayActions', () => {
  test('default', async () => {
    const client = createClient().extend(
      gatewayActions({ app: 'decorated', fetch: paidFetch, url }),
    )

    await client.kv.set({ key: 'greeting', value: 'hello' })
    await client.bucket.put({ key: 'greeting', retention: 60, value: 'hello' })

    expect({
      bucket: await client.bucket.head({ key: 'greeting' }),
      generated: await client.ai.generateText({
        messages: [{ content: 'hi', role: 'user' }],
        model: '@cf/meta/llama-3.1-8b-instruct',
      }),
      kv: await client.kv.get({ key: 'greeting' }),
    }).toMatchInlineSnapshot(`
      {
        "bucket": {
          "contentType": "text/plain;charset=utf-8",
          "etag": ""5"",
          "expiresAt": 60000,
          "key": "greeting",
          "size": 5,
          "uploadedAt": 0,
        },
        "generated": {
          "text": "{"messages":[{"content":"hi","role":"user"}],"model":"@cf/meta/llama-3.1-8b-instruct"}",
          "usage": {
            "inputTokens": 1,
            "outputTokens": 2,
            "totalTokens": 3,
          },
        },
        "kv": {
          "expiresAt": null,
          "key": "greeting",
          "value": "hello",
          "version": 1,
        },
      }
    `)
  })
})
