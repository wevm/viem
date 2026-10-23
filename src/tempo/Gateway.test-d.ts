import { Actions, Gateway } from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

const gateway = Gateway.from({
  app: 'my-app',
  url: 'https://gateway.example.com',
})

test('ai.generateText: prompt or messages', () => {
  Actions.ai.generateText(gateway, { model: 'model', prompt: 'hello' })
  Actions.ai.generateText(gateway, {
    messages: [{ content: 'hello', role: 'user' }],
    model: 'model',
  })
  // @ts-expect-error
  Actions.ai.generateText(gateway, { model: 'model' })
  Actions.ai.generateText(gateway, {
    // @ts-expect-error
    messages: [{ content: 'hello', role: 'user' }],
    model: 'model',
    prompt: 'hello',
  })
})

test('kv.get: entry or null', () => {
  expectTypeOf(Actions.kv.get(gateway, { key: 'key' })).resolves.toEqualTypeOf<{
    expiresAt: number | null
    key: string
    value: unknown
    version: number
  } | null>()
})

test('bucket.get: stream or null', () => {
  expectTypeOf(Actions.bucket.get(gateway, { key: 'key' }))
    .resolves.exclude<null>()
    .toHaveProperty('body')
    .toEqualTypeOf<ReadableStream<Uint8Array>>()
})

test('compute.create: gpuCount needs gpu', () => {
  Actions.compute.create(gateway)
  Actions.compute.create(gateway, { gpu: 'H100', gpuCount: 2 })
  // @ts-expect-error
  Actions.compute.create(gateway, { gpuCount: 2 })
  // @ts-expect-error
  Actions.compute.create(gateway, { gpu: 'H1000' })
})

test('compute.exec: non-empty command', () => {
  Actions.compute.exec(gateway, { command: ['ls', '-la'], sandboxId: 'sb' })
  // @ts-expect-error
  Actions.compute.exec(gateway, { command: [], sandboxId: 'sb' })
})

test('compute.status: running or terminated', () => {
  expectTypeOf(Actions.compute.status(gateway, { sandboxId: 'sb' }))
    .resolves.toHaveProperty('status')
    .toEqualTypeOf<'running' | 'terminated'>()
})

test('compute.create: snapshot excludes image', () => {
  Actions.compute.create(gateway, { image: 'python:3.12-slim', pip: ['numpy'] })
  Actions.compute.create(gateway, { snapshot: 'im-1' })
  Actions.compute.create(gateway, {
    image: 'python:3.12-slim',
    // @ts-expect-error
    snapshot: 'im-1',
  })
})

test('compute.create: tunnels keyed by ports', async () => {
  const sandbox = await Actions.compute.create(gateway, { ports: [8000, 8080] })
  expectTypeOf(sandbox.tunnels).toEqualTypeOf<{
    '8000': string
    '8080': string
  }>()
  // @ts-expect-error
  sandbox.tunnels[9000]
})

test('compute.stream: events narrow by type', async () => {
  for await (const event of Actions.compute.stream(gateway, {
    command: ['ls'],
    sandboxId: 'sb',
  })) {
    if (event.type === 'exit')
      expectTypeOf(event.exitCode).toEqualTypeOf<number | null>()
    else expectTypeOf(event.data).toEqualTypeOf<string>()
  }
})

test('ai.streamText: deltas then usage', async () => {
  for await (const event of Actions.ai.streamText(gateway, {
    model: 'model',
    prompt: 'hi',
  })) {
    if (event.type === 'done') expectTypeOf(event).toHaveProperty('usage')
    else expectTypeOf(event.delta).toEqualTypeOf<string>()
  }
})
