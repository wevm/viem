import { expect, test } from 'vitest'

import { Actions, Client, fallback, http, testActions, webSocket } from 'viem'

import * as anvil from '~test/anvil.js'
import * as Http from '~test/http.js'
import * as Ws from '~test/ws.js'
import { wait } from '../../internal/wait.js'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
  pollingInterval: 100,
})
const testClient = client.extend(testActions())

// Serves a fixed sequence of `eth_blockNumber` responses (clamping to the last)
// so the watcher observes a deterministic block-number stream.
function blockNumberServer(responses: readonly string[]) {
  let calls = 0
  return Http.createServer((req, res) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      const request = JSON.parse(body)
      const result = responses[Math.min(calls, responses.length - 1)]
      calls++
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ id: request.id, jsonrpc: '2.0', result }))
    })
  })
}

// Serves an `eth_subscribe` ack, then pushes the given `newHeads` headers.
function subscriptionServer(headers: readonly Record<string, unknown>[] = []) {
  const subscriptionId = '0xdeadbeef'
  return Ws.createServer((connection, message) => {
    const request = JSON.parse(message)
    if (request.method !== 'eth_subscribe') return
    connection.send(
      JSON.stringify({
        id: request.id,
        jsonrpc: '2.0',
        result: subscriptionId,
      }),
    )
    for (const header of headers)
      connection.send(
        JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_subscription',
          params: { subscription: subscriptionId, result: header },
        }),
      )
  })
}

test('default: emits incoming block numbers via polling', async () => {
  const numbers: bigint[] = []
  const watch = Actions.block.watchNumber(client)
  watch.onBlockNumber((blockNumber) => numbers.push(blockNumber))

  await wait(200)
  await testClient.block.mine({ blocks: 1 })
  await wait(300)
  await testClient.block.mine({ blocks: 1 })
  await wait(300)
  watch.off()
  const head = await Actions.block.getNumber(client, { cacheTime: 0 })

  expect(numbers.length).toBeGreaterThanOrEqual(2)
  expect(numbers).toContain(head)
  for (let i = 1; i < numbers.length; i++)
    expect(numbers[i]! > numbers[i - 1]!).toBe(true)
})

test('multiple listeners: all receive block numbers; unregister is scoped', async () => {
  const server = await blockNumberServer(['0x1', '0x2', '0x3'])
  try {
    const seqClient = Client.create({
      transport: http(server.url),
      pollingInterval: 50,
    })
    const a: bigint[] = []
    const b: bigint[] = []

    const watch = Actions.block.watchNumber(seqClient)
    const offA = watch.onBlockNumber((blockNumber) => a.push(blockNumber))
    watch.onBlockNumber((blockNumber) => b.push(blockNumber))

    await wait(120)
    offA()
    const aAfter = a.length
    await wait(120)
    watch.off()

    // Both listeners saw early blocks.
    expect(a.length).toBeGreaterThanOrEqual(1)
    expect(b.length).toBeGreaterThanOrEqual(1)
    // `a` stopped receiving after its unregister; `b` kept going.
    expect(a.length).toBe(aAfter)
    expect(b.length).toBeGreaterThan(aAfter)
  } finally {
    await server.close()
  }
})

test('off: is idempotent and terminal', async () => {
  const numbers: bigint[] = []
  const watch = Actions.block.watchNumber(client)
  watch.onBlockNumber((blockNumber) => numbers.push(blockNumber))

  await wait(50)
  watch.off()
  watch.off() // second call is a no-op

  // Re-registering after `off` is a no-op and never fires.
  const fired: bigint[] = []
  const offBlock = watch.onBlockNumber((blockNumber) => fired.push(blockNumber))
  const offError = watch.onError(() => fired.push(-1n))
  offBlock()
  offError()

  await testClient.block.mine({ blocks: 1 })
  await wait(200)

  expect(fired).toEqual([])
})

test('emitOnBegin: emits the latest block number immediately', async () => {
  const numbers: bigint[] = []
  const expected = await Actions.block.getNumber(client, { cacheTime: 0 })
  const watch = Actions.block.watchNumber(client, { emitOnBegin: true })
  watch.onBlockNumber((blockNumber) => numbers.push(blockNumber))

  await wait(50)
  watch.off()

  expect(numbers[0]).toBe(expected)
})

test('emitMissed: backfills skipped block numbers', async () => {
  // Drive the block number directly so the watcher observes a multi-block jump
  // (1 -> 5) deterministically, independent of concurrent mining.
  const server = await blockNumberServer(['0x1', '0x5'])
  try {
    const missedClient = Client.create({
      transport: http(server.url),
      pollingInterval: 50,
    })

    const numbers: bigint[] = []
    const watch = Actions.block.watchNumber(missedClient, { emitMissed: true })
    watch.onBlockNumber((blockNumber) => numbers.push(blockNumber))

    await wait(250)
    watch.off()

    expect(numbers).toEqual([1n, 2n, 3n, 4n, 5n])
  } finally {
    await server.close()
  }
})

test('onError: invokes the listener when fetching fails', async () => {
  const bad = Client.create({
    transport: http('http://127.0.0.1:1'),
    pollingInterval: 100,
  })

  const error = await new Promise<Error>((resolve) => {
    const watch = Actions.block.watchNumber(bad)
    watch.onBlockNumber(() => {})
    watch.onError((error) => {
      watch.off()
      resolve(error)
    })
  })

  expect(error).toBeInstanceOf(Error)
})

test('poll: false uses a subscription (webSocket)', async () => {
  const wsClient = Client.create({
    transport: webSocket(anvil.mainnet.rpcUrl.ws, { keepAlive: false }),
  })

  const numbers: bigint[] = []
  const watch = Actions.block.watchNumber(wsClient)
  watch.onBlockNumber((blockNumber) => numbers.push(blockNumber))

  await wait(200)
  await testClient.block.mine({ blocks: 1 })
  await wait(400)
  await testClient.block.mine({ blocks: 1 })
  await wait(400)
  watch.off()
  ;(await wsClient.transport.getRpcClient()).close()

  expect(numbers.length).toBeGreaterThanOrEqual(2)
  for (let i = 1; i < numbers.length; i++)
    expect(numbers[i]! > numbers[i - 1]!).toBe(true)
})

test('subscription: resolves subscribe from a fallback transport', async () => {
  const fallbackClient = Client.create({
    transport: fallback([
      webSocket(anvil.mainnet.rpcUrl.ws, { keepAlive: false }),
      http(anvil.mainnet.rpcUrl.http),
    ]),
  })

  const numbers: bigint[] = []
  const watch = Actions.block.watchNumber(fallbackClient)
  watch.onBlockNumber((blockNumber) => numbers.push(blockNumber))

  await wait(200)
  await testClient.block.mine({ blocks: 1 })
  await wait(400)
  watch.off()
  const { transports } = fallbackClient.transport as unknown as {
    transports: readonly { getRpcClient(): Promise<{ close(): void }> }[]
  }
  ;(await transports[0]!.getRpcClient()).close()

  expect(numbers.length).toBeGreaterThanOrEqual(1)
})

test('subscription: invokes onError when the subscription fails', async () => {
  const bad = Client.create({
    transport: webSocket('ws://127.0.0.1:1', {
      keepAlive: false,
      reconnect: false,
    }),
  })

  const error = await new Promise<Error>((resolve) => {
    const watch = Actions.block.watchNumber(bad)
    watch.onBlockNumber(() => {})
    watch.onError((error) => {
      watch.off()
      resolve(error)
    })
  })

  expect(error).toBeInstanceOf(Error)
})

test('subscription: drops buffered data after off', async () => {
  // The server sends a `newHeads` notification alongside the subscription ack,
  // so the header is buffered before `onData` attaches. Tearing down before the
  // `subscribe` promise resolves means the buffered header flushes after the
  // watcher is inactive and must be dropped.
  const server = await subscriptionServer([{ number: '0x1' }])
  try {
    const wsClient = Client.create({
      transport: webSocket(server.url, { keepAlive: false, reconnect: false }),
    })

    const numbers: bigint[] = []
    const watch = Actions.block.watchNumber(wsClient)
    watch.onBlockNumber((blockNumber) => numbers.push(blockNumber))
    // Tear down synchronously, before the async `subscribe` call resolves.
    watch.off()

    await wait(200)
    ;(await wsClient.transport.getRpcClient()).close()

    expect(numbers).toEqual([])
  } finally {
    await server.close()
  }
})

test('polling: skips block numbers that do not advance', async () => {
  // Return a higher block number, then a lower one (simulating a reorg the
  // watcher must ignore rather than emit a backwards block number).
  const server = await blockNumberServer(['0x5', '0x3'])
  try {
    const reorgClient = Client.create({
      transport: http(server.url),
      pollingInterval: 50,
    })

    const numbers: bigint[] = []
    const watch = Actions.block.watchNumber(reorgClient)
    watch.onBlockNumber((blockNumber) => numbers.push(blockNumber))

    await wait(250)
    watch.off()

    expect(numbers).toEqual([5n])
  } finally {
    await server.close()
  }
})

test('subscription: ignores data delivered after off', async () => {
  const server = await subscriptionServer()
  try {
    const wsClient = Client.create({
      transport: webSocket(server.url, { keepAlive: false, reconnect: false }),
    })

    const numbers: bigint[] = []
    const watch = Actions.block.watchNumber(wsClient)
    watch.onBlockNumber((blockNumber) => numbers.push(blockNumber))

    // Wait for the subscription to open, then tear down and push a late head.
    await wait(150)
    watch.off()
    server.connections[0]!.send(
      JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_subscription',
        params: { subscription: '0xdeadbeef', result: { number: '0x2a' } },
      }),
    )
    await wait(100)
    ;(await wsClient.transport.getRpcClient()).close()

    expect(numbers).toEqual([])
  } finally {
    await server.close()
  }
})

test('subscription: skips headers without a block number', async () => {
  const server = await subscriptionServer([{}, { number: '0x2a' }])
  try {
    const wsClient = Client.create({
      transport: webSocket(server.url, { keepAlive: false, reconnect: false }),
    })

    const numbers: bigint[] = []
    const watch = Actions.block.watchNumber(wsClient)
    watch.onBlockNumber((blockNumber) => numbers.push(blockNumber))

    await wait(200)
    watch.off()
    ;(await wsClient.transport.getRpcClient()).close()

    expect(numbers).toEqual([42n])
  } finally {
    await server.close()
  }
})

test('subscription: forwards subscription errors to onError', async () => {
  const server = await subscriptionServer()
  try {
    const wsClient = Client.create({
      transport: webSocket(server.url, { keepAlive: false, reconnect: false }),
    })

    const error = await new Promise<Error>((resolve) => {
      const watch = Actions.block.watchNumber(wsClient)
      watch.onBlockNumber(() => {})
      watch.onError((error) => resolve(error))
      // Drop the connection once the subscription is established.
      wait(100).then(() => server.dropAll())
    })

    expect(error).toBeInstanceOf(Error)
  } finally {
    await server.close()
  }
})

test('async iterator: yields incoming block numbers', async () => {
  const server = await subscriptionServer()
  try {
    const wsClient = Client.create({
      transport: webSocket(server.url, { keepAlive: false, reconnect: false }),
    })

    const watch = Actions.block.watchNumber(wsClient)
    const iterator = watch[Symbol.asyncIterator]()

    // Push two heads once the subscription is open.
    await wait(150)
    server.connections[0]!.send(
      JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_subscription',
        params: { subscription: '0xdeadbeef', result: { number: '0x1' } },
      }),
    )

    const first = await iterator.next()
    expect(first.done).toBe(false)
    expect(first.value).toEqual({ blockNumber: 1n, prevBlockNumber: undefined })

    server.connections[0]!.send(
      JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_subscription',
        params: { subscription: '0xdeadbeef', result: { number: '0x2' } },
      }),
    )
    const second = await iterator.next()
    expect(second.value).toEqual({ blockNumber: 2n, prevBlockNumber: 1n })

    await iterator.return!()
    watch.off()
    ;(await wsClient.transport.getRpcClient()).close()
  } finally {
    await server.close()
  }
})

test('async iterator: keeps only the latest buffered block', async () => {
  // Two heads arrive before the first `next()`, so the older one is dropped.
  const server = await subscriptionServer([
    { number: '0x1' },
    { number: '0x5' },
  ])
  try {
    const wsClient = Client.create({
      transport: webSocket(server.url, { keepAlive: false, reconnect: false }),
    })

    const watch = Actions.block.watchNumber(wsClient)
    const iterator = watch[Symbol.asyncIterator]()

    await wait(200)
    const first = await iterator.next()
    expect(first.value).toEqual({ blockNumber: 5n, prevBlockNumber: 1n })

    await iterator.return!()
    watch.off()
    ;(await wsClient.transport.getRpcClient()).close()
  } finally {
    await server.close()
  }
})

test('async iterator: works with for-await and off ends the loop', async () => {
  const wsClient = Client.create({
    transport: webSocket(anvil.mainnet.rpcUrl.ws, { keepAlive: false }),
  })

  const numbers: bigint[] = []
  const watch = Actions.block.watchNumber(wsClient)
  const loop = (async () => {
    for await (const { blockNumber } of watch) numbers.push(blockNumber)
  })()

  await wait(200)
  await testClient.block.mine({ blocks: 1 })
  await wait(400)
  watch.off()
  await loop
  ;(await wsClient.transport.getRpcClient()).close()

  expect(numbers.length).toBeGreaterThanOrEqual(1)
})

test('async iterator: return() stops iteration', async () => {
  const watch = Actions.block.watchNumber(client)
  const iterator = watch[Symbol.asyncIterator]()

  const result = await iterator.return!()
  expect(result).toEqual({ done: true, value: undefined })

  // Subsequent `next()` reports completion.
  expect(await iterator.next()).toEqual({ done: true, value: undefined })
  watch.off()
})

test('async iterator: off() resolves a pending next() as done', async () => {
  const watch = Actions.block.watchNumber(client)
  const iterator = watch[Symbol.asyncIterator]()

  const next = iterator.next()
  watch.off()

  expect(await next).toEqual({ done: true, value: undefined })
})

test('async iterator: throws a stored error', async () => {
  const server = await subscriptionServer()
  try {
    const wsClient = Client.create({
      transport: webSocket(server.url, { keepAlive: false, reconnect: false }),
    })

    const watch = Actions.block.watchNumber(wsClient)
    const iterator = watch[Symbol.asyncIterator]()

    // Drop the connection (no pending `next()`), so the error buffers on the
    // iterator, then surfaces on the subsequent `next()`.
    await wait(150)
    server.dropAll()
    await wait(150)

    await expect(iterator.next()).rejects.toBeInstanceOf(Error)
    watch.off()
    ;(await wsClient.transport.getRpcClient()).close()
  } finally {
    await server.close()
  }
})

test('async iterator: is iterable on itself (for-await over iterator)', async () => {
  const server = await subscriptionServer([{ number: '0x1' }])
  try {
    const wsClient = Client.create({
      transport: webSocket(server.url, { keepAlive: false, reconnect: false }),
    })

    const watch = Actions.block.watchNumber(wsClient)
    const iterator = watch[Symbol.asyncIterator]()

    const numbers: bigint[] = []
    const loop = (async () => {
      for await (const { blockNumber } of iterator) {
        numbers.push(blockNumber)
        break
      }
    })()

    await loop
    watch.off()
    ;(await wsClient.transport.getRpcClient()).close()

    expect(numbers).toEqual([1n])
  } finally {
    await server.close()
  }
})

test('async iterator: rejects a pending next() on error', async () => {
  const server = await subscriptionServer()
  try {
    const wsClient = Client.create({
      transport: webSocket(server.url, { keepAlive: false, reconnect: false }),
    })

    const watch = Actions.block.watchNumber(wsClient)
    const iterator = watch[Symbol.asyncIterator]()

    await wait(150)
    const next = iterator.next()
    server.dropAll()

    await expect(next).rejects.toBeInstanceOf(Error)
    watch.off()
    ;(await wsClient.transport.getRpcClient()).close()
  } finally {
    await server.close()
  }
})
