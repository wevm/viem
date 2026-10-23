import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { createRequestListener } from '@remix-run/node-fetch-server'
import { Actions, createClient, Gateway, gatewayActions } from 'viem/tempo'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

type Entry = {
  expiresAt: number
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
const sandboxes = new Map<
  string,
  { gpu: string | null; image: string; running: boolean }
>()
const files = new Map<string, Uint8Array>()

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

  if (pathname === '/v1/compute/write') {
    const bytes = new Uint8Array(await request.arrayBuffer())
    if (bytes.byteLength !== Number(request.headers.get('gateway-size')))
      return problem(400, 'invalid_request', 'Gateway-Size does not match.')
    const sandbox = request.headers.get('gateway-sandbox') ?? ''
    const path = request.headers.get('gateway-path') ?? ''
    files.set(scope(`${sandbox}${path}`), bytes)
    return Response.json({ path, size: bytes.byteLength })
  }

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

  if (pathname.startsWith('/v1/compute/')) {
    const input = body as unknown as {
      command?: string[]
      gpu?: string
      gpuCount?: number
      image?: string
      offset?: number
      path?: string
      ports?: number[]
      sandboxId?: string
      snapshot?: string
    }
    const sandbox = sandboxes.get(scope(input.sandboxId ?? ''))
    const view = (sandboxId: string, gpu: string | null, image: string) => ({
      createdAt: 0,
      expiresAt: 300_000,
      gpu,
      image,
      paidUntil: 300_000,
      sandboxId,
    })
    if (pathname === '/v1/compute/create') {
      const sandboxId = `sb-${sandboxes.size + 1}`
      const gpu = input.gpu
        ? input.gpuCount
          ? `${input.gpu}:${input.gpuCount}`
          : input.gpu
        : null
      const image = input.snapshot ?? input.image ?? 'python:3.12-slim'
      sandboxes.set(scope(sandboxId), { gpu, image, running: true })
      return Response.json({
        ...view(sandboxId, gpu, image),
        tunnels: Object.fromEntries(
          (input.ports ?? []).map((port) => [
            port,
            `https://${port}.tunnel.test`,
          ]),
        ),
      })
    }
    if (pathname === '/v1/compute/list')
      return Response.json({
        cursor: null,
        sandboxes: [...sandboxes]
          .filter(([key, value]) => key.startsWith(scope('')) && value.running)
          .map(([key, value]) =>
            view(key.slice(scope('').length), value.gpu, value.image),
          ),
      })
    if (!sandbox?.running)
      return problem(404, 'not_found', `${input.sandboxId} does not exist.`)
    const file = (path: string) => scope(`${input.sandboxId}${path}`)
    const ndjson = (events: readonly object[]) =>
      new Response(
        events.map((event) => `${JSON.stringify(event)}\n`).join(''),
        {
          headers: { 'content-type': 'application/x-ndjson' },
        },
      )
    switch (pathname) {
      case '/v1/compute/renew':
        return Response.json({
          ...view(input.sandboxId ?? '', sandbox.gpu, sandbox.image),
          paidUntil: 600_000,
        })
      case '/v1/compute/stream':
        if (input.command?.[0] === 'fail')
          return ndjson([
            { data: 'partial', type: 'stdout' },
            {
              code: 'upstream_failed',
              detail: 'Lost the sandbox.',
              type: 'error',
            },
          ])
        return ndjson([
          { data: 'out\n', type: 'stdout' },
          { data: 'err\n', type: 'stderr' },
          { exitCode: 3, timedOut: false, type: 'exit' },
        ])
      case '/v1/compute/logs':
        return ndjson([
          { data: 'step 1\n', offset: 7, type: 'log' },
          { data: 'step 2\n', offset: 14, type: 'log' },
          { exitCode: 0, offset: 14, type: 'exit' },
        ])
      case '/v1/compute/exec':
        return Response.json({
          exitCode: 0,
          stderr: '',
          stdout: `${input.command?.join(' ')}\n`,
          timedOut: false,
          truncated: false,
        })
      case '/v1/compute/read': {
        const bytes = files.get(file(input.path ?? ''))
        if (!bytes)
          return problem(404, 'not_found', `${input.path} does not exist.`)
        return new Response(bytes.slice(input.offset ?? 0), {
          headers: { 'gateway-file-size': String(bytes.byteLength) },
        })
      }
      case '/v1/compute/snapshot':
        return Response.json({ createdAt: 0, expiresAt: 1, snapshot: 'im-1' })
      case '/v1/compute/spawn':
        files.set(
          file('/tmp/gateway/1.log'),
          new TextEncoder().encode(`${input.command?.join(' ')}\n`),
        )
        files.set(
          file('/tmp/gateway/1.log.exit'),
          new TextEncoder().encode('0\n'),
        )
        return Response.json({
          exitPath: '/tmp/gateway/1.log.exit',
          logPath: '/tmp/gateway/1.log',
          pid: 1,
        })
      case '/v1/compute/status':
        return Response.json({
          ...view(input.sandboxId ?? '', sandbox.gpu, sandbox.image),
          exitCode: null,
          status: 'running',
        })
      case '/v1/compute/terminate':
        sandbox.running = false
        return Response.json({
          exitCode: 0,
          sandboxId: input.sandboxId,
          status: 'terminated',
        })
    }
  }

  switch (pathname) {
    case '/v1/ai/embed':
      return Response.json({ embeddings: [[0.5, 0.25]], shape: [1, 2] })
    case '/v1/ai/generate':
      if ((body as unknown as { stream?: boolean }).stream)
        return new Response(
          [
            { delta: 'thinking', type: 'reasoning' },
            { delta: 'Hello', type: 'text' },
            { delta: ' world', type: 'text' },
            {
              type: 'done',
              usage: {
                completion_tokens: 2,
                prompt_tokens: 1,
                total_tokens: 3,
              },
            },
          ]
            .map((event) => `${JSON.stringify(event)}\n`)
            .join(''),
          { headers: { 'content-type': 'application/x-ndjson' } },
        )
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
        expiresAt: (body.ttl ?? 7_776_000) * 1000,
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

      Version: viem@2.57.10]
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
        model: '@cf/baai/bge-m3',
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

  test('streamText', async () => {
    const gateway = Gateway.from({ app: 'ai', fetch: paidFetch, url })

    const events = []
    for await (const event of Actions.ai.streamText(gateway, {
      model: '@cf/zai-org/glm-5.3',
      prompt: 'hi',
    }))
      events.push(event)

    expect(events).toMatchInlineSnapshot(`
      [
        {
          "delta": "thinking",
          "type": "reasoning",
        },
        {
          "delta": "Hello",
          "type": "text",
        },
        {
          "delta": " world",
          "type": "text",
        },
        {
          "type": "done",
          "usage": {
            "inputTokens": 1,
            "outputTokens": 2,
            "totalTokens": 3,
          },
        },
      ]
    `)
  })

  test('generateText', async () => {
    const gateway = Gateway.from({ app: 'ai', fetch: paidFetch, url })

    expect(
      await Actions.ai.generateText(gateway, {
        maxOutputTokens: 16,
        model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
        prompt: 'hello',
      }),
    ).toMatchInlineSnapshot(`
      {
        "text": "{"maxOutputTokens":16,"model":"@cf/meta/llama-3.3-70b-instruct-fp8-fast","prompt":"hello"}",
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
          "expiresAt": 7776000000,
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
              "expiresAt": 7776000000,
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
          "expiresAt": 7776000000,
          "key": "counter",
          "value": {
            "count": 2,
          },
          "version": 2,
        },
        "updated": {
          "expiresAt": 7776000000,
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

describe('compute', () => {
  test('default', async () => {
    const gateway = Gateway.from({ app: 'compute', fetch: paidFetch, url })

    const created = await Actions.compute.create(gateway, {
      gpu: 'H100',
      gpuCount: 2,
      ports: [8000],
      timeout: 600,
    })
    const { sandboxId } = created
    const executed = await Actions.compute.exec(gateway, {
      command: ['python', '-c', 'print(1)'],
      sandboxId,
    })
    const status = await Actions.compute.status(gateway, { sandboxId })
    const listed = await Actions.compute.list(gateway)
    const terminated = await Actions.compute.terminate(gateway, { sandboxId })

    expect({
      created,
      executed,
      listed,
      status,
      terminated,
    }).toMatchInlineSnapshot(`
      {
        "created": {
          "createdAt": 0,
          "expiresAt": 300000,
          "gpu": "H100:2",
          "image": "python:3.12-slim",
          "paidUntil": 300000,
          "sandboxId": "sb-1",
          "tunnels": {
            "8000": "https://8000.tunnel.test",
          },
        },
        "executed": {
          "exitCode": 0,
          "stderr": "",
          "stdout": "python -c print(1)
      ",
          "timedOut": false,
          "truncated": false,
        },
        "listed": {
          "cursor": null,
          "sandboxes": [
            {
              "createdAt": 0,
              "expiresAt": 300000,
              "gpu": "H100:2",
              "image": "python:3.12-slim",
              "paidUntil": 300000,
              "sandboxId": "sb-1",
            },
          ],
        },
        "status": {
          "createdAt": 0,
          "exitCode": null,
          "expiresAt": 300000,
          "gpu": "H100:2",
          "image": "python:3.12-slim",
          "paidUntil": 300000,
          "sandboxId": "sb-1",
          "status": "running",
        },
        "terminated": {
          "exitCode": 0,
          "sandboxId": "sb-1",
          "status": "terminated",
        },
      }
    `)
  })

  test('behavior: files, background jobs and snapshots', async () => {
    const gateway = Gateway.from({ app: 'compute', fetch: paidFetch, url })

    const { sandboxId } = await Actions.compute.create(gateway)
    const written = await Actions.compute.write(gateway, {
      path: '/root/train.py',
      sandboxId,
      value: 'print("training")',
    })
    const script = await Actions.compute.read(gateway, {
      offset: 6,
      path: '/root/train.py',
      sandboxId,
    })
    const job = await Actions.compute.spawn(gateway, {
      command: ['python', 'train.py'],
      sandboxId,
    })
    const log = await Actions.compute.read(gateway, {
      path: job.logPath,
      sandboxId,
    })
    const missing = await Actions.compute.read(gateway, {
      path: '/nope',
      sandboxId,
    })
    const { snapshot } = await Actions.compute.snapshot(gateway, { sandboxId })
    const copy = await Actions.compute.create(gateway, { snapshot })

    expect({
      copy: copy.image,
      job,
      log: log && (await new Response(log.body).text()),
      missing,
      script: script && {
        offset: script.offset,
        size: script.size,
        text: await new Response(script.body).text(),
      },
      written,
    }).toMatchInlineSnapshot(`
      {
        "copy": "im-1",
        "job": {
          "exitPath": "/tmp/gateway/1.log.exit",
          "logPath": "/tmp/gateway/1.log",
          "pid": 1,
        },
        "log": "python train.py
      ",
        "missing": null,
        "script": {
          "offset": 6,
          "size": 17,
          "text": ""training")",
        },
        "written": {
          "path": "/root/train.py",
          "size": 17,
        },
      }
    `)
  })

  test('behavior: metering and streaming', async () => {
    const gateway = Gateway.from({ app: 'compute', fetch: paidFetch, url })

    const { sandboxId } = await Actions.compute.create(gateway, {
      lease: 60,
      timeout: 600,
    })
    const renewed = await Actions.compute.renew(gateway, {
      sandboxId,
      seconds: 300,
    })
    const streamed = []
    for await (const event of Actions.compute.stream(gateway, {
      command: ['python', 'train.py'],
      sandboxId,
    }))
      streamed.push(event)
    const logged = []
    for await (const event of Actions.compute.logs(gateway, {
      logPath: '/tmp/gateway/1.log',
      sandboxId,
    }))
      logged.push(event)
    const failed = await (async () => {
      for await (const _ of Actions.compute.stream(gateway, {
        command: ['fail'],
        sandboxId,
      })) {
      }
    })().catch((error) => error)

    expect(renewed.paidUntil).toBe(600_000)
    expect({ logged, streamed }).toMatchInlineSnapshot(`
      {
        "logged": [
          {
            "data": "step 1
      ",
            "offset": 7,
            "type": "log",
          },
          {
            "data": "step 2
      ",
            "offset": 14,
            "type": "log",
          },
          {
            "exitCode": 0,
            "offset": 14,
            "type": "exit",
          },
        ],
        "streamed": [
          {
            "data": "out
      ",
            "type": "stdout",
          },
          {
            "data": "err
      ",
            "type": "stderr",
          },
          {
            "exitCode": 3,
            "timedOut": false,
            "type": "exit",
          },
        ],
      }
    `)
    expect(failed).toBeInstanceOf(Gateway.RequestError)
    expect(failed.detail).toBe('Lost the sandbox.')
  })

  test('behavior: ended sandbox', async () => {
    const gateway = Gateway.from({ app: 'compute', fetch: paidFetch, url })

    const { sandboxId } = await Actions.compute.create(gateway)
    await Actions.compute.terminate(gateway, { sandboxId })

    const error = await Actions.compute
      .exec(gateway, { command: ['true'], sandboxId })
      .catch((error) => error)
    expect(error).toBeInstanceOf(Gateway.RequestError)
    expect(error.code).toBe('not_found')
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
        model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
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
          "text": "{"messages":[{"content":"hi","role":"user"}],"model":"@cf/meta/llama-3.3-70b-instruct-fp8-fast"}",
          "usage": {
            "inputTokens": 1,
            "outputTokens": 2,
            "totalTokens": 3,
          },
        },
        "kv": {
          "expiresAt": 7776000000,
          "key": "greeting",
          "value": "hello",
          "version": 1,
        },
      }
    `)
  })
})
