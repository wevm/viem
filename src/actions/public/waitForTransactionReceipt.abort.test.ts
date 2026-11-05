import { once } from 'node:events'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { createPublicClient, fallback, http } from 'viem'
import { waitForTransactionReceipt } from 'viem/actions'
import { expect, onTestFinished, test } from 'vitest'

import { listenersCache } from '../../utils/observe.js'
import { withResolvers } from '../../utils/promise/withResolvers.js'
import { wait } from '../../utils/wait.js'

const hash =
  '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d'
const receipt = {
  blockHash: `0x${'ab'.repeat(32)}`,
  blockNumber: '0x1',
  contractAddress: null,
  cumulativeGasUsed: '0x5208',
  effectiveGasPrice: '0x1',
  from: `0x${'11'.repeat(20)}`,
  gasUsed: '0x5208',
  logs: [],
  logsBloom: `0x${'00'.repeat(256)}`,
  status: '0x1',
  to: `0x${'22'.repeat(20)}`,
  transactionHash: hash,
  transactionIndex: '0x0',
  type: '0x2',
}

// A local JSON-RPC peer lets each test control receipt availability and hold
// real HTTP responses while cancellation tears down the wait.
async function createConnection() {
  const state = { blockNumber: 1n, mined: false, pending: false }
  const gates = new Map<string, ReturnType<typeof withResolvers<void>>>()
  const server = createServer(async (request, response) => {
    let text = ''
    for await (const chunk of request) text += chunk
    const body = JSON.parse(text) as { id: number; method: string }
    server.emit(body.method)
    await gates.get(body.method)?.promise

    const result = (() => {
      if (body.method === 'eth_blockNumber')
        return `0x${state.blockNumber.toString(16)}`
      if (body.method === 'eth_getTransactionReceipt')
        return state.mined ? receipt : null
      if (body.method === 'eth_getTransactionByHash')
        return state.pending
          ? {
              blockHash: null,
              blockNumber: null,
              from: receipt.from,
              gas: '0x5208',
              gasPrice: '0x1',
              hash,
              input: '0x',
              nonce: '0x0',
              r: '0x1',
              s: '0x1',
              to: receipt.to,
              transactionIndex: null,
              type: '0x0',
              v: '0x1b',
              value: '0x0',
            }
          : null
      if (body.method === 'eth_getBlockByNumber') return null
      return undefined
    })()
    response.setHeader('content-type', 'application/json')
    response.end(
      JSON.stringify({
        id: body.id,
        jsonrpc: '2.0',
        ...(result === undefined
          ? { error: { code: -32601, message: 'Method not found' } }
          : { result }),
      }),
    )
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  onTestFinished(async () => {
    for (const gate of gates.values()) gate.resolve()
    server.closeAllConnections()
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    )
  })
  const { port } = server.address() as AddressInfo
  return {
    hold(method: string) {
      const gate = withResolvers<void>()
      gates.set(method, gate)
      return () => gate.resolve()
    },
    received: (method: string) => once(server, method),
    state,
    url: `http://127.0.0.1:${port}`,
  }
}

const options = { checkReplacement: false, hash, timeout: 1_000 } as const

test('rejects a pre-aborted wait without creating observers', async () => {
  const controller = new AbortController()
  const reason = new Error('Receipt wait cancelled')
  controller.abort(reason)
  const client = createPublicClient({ transport: http('http://127.0.0.1:1') })

  await expect(
    waitForTransactionReceipt(client, {
      ...options,
      requestOptions: { signal: controller.signal },
    }),
  ).rejects.toBe(reason)

  expect(listenersCache.size).toMatchInlineSnapshot('0')
})

test('does not install a watcher after aborting the initial receipt request', async () => {
  const connection = await createConnection()
  const release = connection.hold('eth_getTransactionReceipt')
  const received = connection.received('eth_getTransactionReceipt')
  const client = createPublicClient({ transport: http(connection.url) })
  const controller = new AbortController()
  const reason = new Error('Receipt wait cancelled during setup')
  const pending = client.waitForTransactionReceipt({
    ...options,
    requestOptions: { signal: controller.signal },
  })
  const rejected = expect(pending).rejects.toBe(reason)
  await received

  controller.abort(reason)
  await rejected
  release()
  // Allow the cancelled setup continuation to run after the HTTP response.
  await wait(20)

  expect(listenersCache.size).toMatchInlineSnapshot('0')
})

test.each(['http', 'fallback'] as const)(
  'stops an active wait without a timeout (%s)',
  async (transport) => {
    const connection = await createConnection()
    const client = createPublicClient({
      pollingInterval: 10,
      transport:
        transport === 'http'
          ? http(connection.url)
          : fallback([http(connection.url)]),
    })
    const controller = new AbortController()
    const pending = client.waitForTransactionReceipt({
      ...options,
      requestOptions: { signal: controller.signal },
      timeout: 0,
    })
    const rejected = expect(pending).rejects.toMatchObject({
      name: 'AbortError',
    })
    await expect.poll(() => listenersCache.size).toBe(2)

    controller.abort()
    await rejected

    expect(listenersCache.size).toMatchInlineSnapshot('0')
  },
)

test('keeps an independent wait for the same hash running', async () => {
  const connection = await createConnection()
  const client = createPublicClient({
    pollingInterval: 10,
    transport: http(connection.url),
  })
  const controller = new AbortController()
  const otherController = new AbortController()
  const pending = client.waitForTransactionReceipt({
    ...options,
    requestOptions: { signal: controller.signal },
  })
  const rejected = expect(pending).rejects.toMatchObject({ name: 'AbortError' })
  const other = client.waitForTransactionReceipt({
    ...options,
    requestOptions: { signal: otherController.signal },
  })
  await expect.poll(() => listenersCache.size).toBe(4)

  controller.abort()
  await rejected
  expect(listenersCache.size).toMatchInlineSnapshot('2')
  connection.state.mined = true
  connection.state.blockNumber = 2n
  const result = await other

  expect(result.transactionHash).toMatchInlineSnapshot(
    '"0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d"',
  )
  expect(result.status).toMatchInlineSnapshot('"success"')
  expect(listenersCache.size).toMatchInlineSnapshot('0')
})

test('interrupts transaction lookup retries', async () => {
  const connection = await createConnection()
  const received = connection.received('eth_getTransactionByHash')
  const client = createPublicClient({
    pollingInterval: 10,
    transport: http(connection.url, { retryCount: 0 }),
  })
  const controller = new AbortController()
  const pending = client.waitForTransactionReceipt({
    hash,
    requestOptions: { signal: controller.signal },
    retryDelay: 10_000,
    timeout: 0,
  })
  const rejected = expect(pending).rejects.toMatchObject({ name: 'AbortError' })
  await received
  await wait(20)

  controller.abort()
  await rejected

  expect(listenersCache.size).toMatchInlineSnapshot('0')
})

test('cleans up concurrent waits sharing a signal after success', async () => {
  const connection = await createConnection()
  connection.state.mined = true
  const client = createPublicClient({ transport: http(connection.url) })
  const controller = new AbortController()
  const parameters = {
    ...options,
    requestOptions: { signal: controller.signal },
  }

  const [first, second] = await Promise.all([
    client.waitForTransactionReceipt(parameters),
    client.waitForTransactionReceipt(parameters),
  ])

  expect(first).toEqual(second)
  expect(first.status).toMatchInlineSnapshot('"success"')
  expect(listenersCache.size).toMatchInlineSnapshot('0')
})

test.each([false, true])(
  'cleans up a wait after its timeout (signal: %s)',
  async (signalled) => {
    const connection = await createConnection()
    const client = createPublicClient({ transport: http(connection.url) })
    const controller = new AbortController()

    await expect(
      client.waitForTransactionReceipt({
        ...options,
        requestOptions: signalled ? { signal: controller.signal } : undefined,
        timeout: 40,
      }),
    ).rejects.toMatchObject({ name: 'WaitForTransactionReceiptTimeoutError' })

    expect(listenersCache.size).toMatchInlineSnapshot('0')
  },
)

test('interrupts replacement block lookup retries', async () => {
  const connection = await createConnection()
  connection.state.pending = true
  const received = connection.received('eth_getBlockByNumber')
  const client = createPublicClient({
    pollingInterval: 10,
    transport: http(connection.url, { retryCount: 0 }),
  })
  const controller = new AbortController()
  const pending = client.waitForTransactionReceipt({
    hash,
    requestOptions: { signal: controller.signal },
    retryDelay: 10_000,
    timeout: 0,
  })
  const rejected = expect(pending).rejects.toMatchObject({ name: 'AbortError' })
  await received
  await wait(20)

  controller.abort()
  await rejected

  expect(listenersCache.size).toMatchInlineSnapshot('0')
})

test('stops waiting for additional confirmations', async () => {
  const connection = await createConnection()
  connection.state.mined = true
  const client = createPublicClient({
    pollingInterval: 10,
    transport: http(connection.url),
  })
  const controller = new AbortController()
  const pending = client.waitForTransactionReceipt({
    ...options,
    confirmations: 3,
    requestOptions: { signal: controller.signal },
  })
  const rejected = expect(pending).rejects.toMatchObject({ name: 'AbortError' })
  await expect.poll(() => listenersCache.size).toBe(2)

  controller.abort()
  await rejected

  expect(listenersCache.size).toMatchInlineSnapshot('0')
})

test.each([false, true])(
  'resolves after enough confirmations (signal: %s)',
  async (signalled) => {
    const connection = await createConnection()
    connection.state.mined = true
    const client = createPublicClient({
      pollingInterval: 10,
      transport: http(connection.url),
    })
    const controller = new AbortController()
    const pending = client.waitForTransactionReceipt({
      ...options,
      confirmations: 3,
      requestOptions: signalled ? { signal: controller.signal } : undefined,
    })
    await expect.poll(() => listenersCache.size).toBe(2)

    connection.state.blockNumber = 3n
    const result = await pending

    expect(result.status).toMatchInlineSnapshot('"success"')
    expect(result.blockNumber).toMatchInlineSnapshot('1n')
    expect(listenersCache.size).toMatchInlineSnapshot('0')
  },
)
