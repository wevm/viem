import { expect, test } from 'vitest'

import {
  Actions,
  Client,
  fallback,
  http,
  publicActions,
  testActions,
  webSocket,
} from 'viem'

import * as anvil from '~test/anvil.js'
import * as Http from '~test/http.js'
import * as Ws from '~test/ws.js'
import { wait } from '../../internal/wait.js'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
  pollingInterval: 100,
})
const testClient = client.extend(testActions())

// A real RPC block (transactions/withdrawals trimmed) used as a template so the
// deterministic servers can serve well-formed blocks at arbitrary numbers.
const baseBlock = {
  hash: '0xd028bdc00aff985bdf872d6b961110d41a6fe4df5e93aeb6dffe2f38ae0a4f7d',
  parentHash:
    '0x019d374731477005b8d3e3236aca44d11ef53fc9eb0ab0c9e11f942636b04b1b',
  sha3Uncles:
    '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
  miner: '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5',
  stateRoot:
    '0xadea44d9167ee7c415601810dbb3f090de70edfdea34632b7e077cefad038af3',
  transactionsRoot:
    '0x5c41008fd93b95aff0a1a453b657539b7e43d67d20c196c87fe59f5f2f1dd214',
  receiptsRoot:
    '0x230fa17d30bd0ca83606cd4704400735bf05cd09110bc96eeee7dbfbc0f870c9',
  logsBloom: `0x${'0'.repeat(512)}`,
  difficulty: '0x0',
  number: '0x1',
  gasLimit: '0x224c7ad',
  gasUsed: '0xd83b57',
  timestamp: '0x67fc55db',
  extraData: '0x6265617665726275696c642e6f7267',
  mixHash: '0x33fd71ca8e38da7aa264c9b9252b7d2864484826eeeae67c2aaf3ab0a756f133',
  nonce: '0x0000000000000000',
  baseFeePerGas: '0x25e3b018',
  withdrawalsRoot:
    '0x96c5c22e9b58cb7141b2aecf4250fc84b0486a00a78353cdcfc9d42c214b2127',
  blobGasUsed: '0xc0000',
  excessBlobGas: '0x180000',
  parentBeaconBlockRoot:
    '0xa7b4e889e408381f1860000a708b6e5fd42ccd9de7fb1cb442a8e91ecb9e6f6c',
  size: '0x1595e',
  uncles: [],
  transactions: [
    '0xa830b5e09e6d2709eaddc555c12fe5177aa22a0862869aefab392d64bcb67926',
  ],
  withdrawals: [
    {
      index: '0x4fc875b',
      validatorIndex: '0xbee4f',
      address: '0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f',
      amount: '0x12380f1',
    },
  ],
} as const

function makeBlock(number: bigint) {
  return {
    ...baseBlock,
    number: `0x${number.toString(16)}`,
  }
}

// Serves a fixed sequence of `eth_getBlockByNumber` blocks (clamping to the
// last) so the watcher observes a deterministic block stream. Other read
// methods used during decoding fall back to the cached block.
function blockServer(numbers: readonly bigint[]) {
  let calls = 0
  return Http.createServer((req, res) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      const request = JSON.parse(body)
      const requests = Array.isArray(request) ? request : [request]
      const responses = requests.map((r) => {
        if (r.method === 'eth_getBlockByNumber') {
          const tag = r.params?.[0]
          const number =
            typeof tag === 'string' && tag.startsWith('0x')
              ? BigInt(tag)
              : numbers[Math.min(calls++, numbers.length - 1)]!
          return { id: r.id, jsonrpc: '2.0', result: makeBlock(number) }
        }
        return { id: r.id, jsonrpc: '2.0', result: null }
      })
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(Array.isArray(request) ? responses : responses[0]))
    })
  })
}

// Serves an `eth_subscribe` ack, then pushes the given `newHeads` headers.
// `eth_getBlockByNumber` lookups (triggered per head) resolve from `blocks`.
function subscriptionServer(
  headers: readonly Record<string, unknown>[] = [],
  blocks: Record<string, ReturnType<typeof makeBlock> | null> = {},
) {
  const subscriptionId = '0xdeadbeef'
  return Ws.createServer((connection, message) => {
    const request = JSON.parse(message)
    if (request.method === 'eth_getBlockByNumber') {
      const tag = request.params?.[0] as string
      connection.send(
        JSON.stringify({
          id: request.id,
          jsonrpc: '2.0',
          result: tag in blocks ? blocks[tag] : makeBlock(BigInt(tag)),
        }),
      )
      return
    }
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

async function waitForSubscription(
  server: Awaited<ReturnType<typeof subscriptionServer>>,
) {
  await expect
    .poll(
      () =>
        server.connections.some(({ messages }) =>
          messages.some(
            (message) => JSON.parse(message).method === 'eth_subscribe',
          ),
        ),
      { interval: 10, timeout: 1_000 },
    )
    .toBe(true)
}

test('default: emits incoming blocks via polling', async () => {
  const server = await blockServer([1n, 2n, 3n])
  try {
    const seqClient = Client.create({
      transport: http(server.url),
      pollingInterval: 50,
    }).extend(publicActions())

    const numbers: bigint[] = []
    const watch = seqClient.block.watch()
    watch.onBlock((block) => numbers.push(block.number!))

    await wait(250)
    watch.off()

    expect(numbers.length).toBeGreaterThanOrEqual(2)
    for (let i = 1; i < numbers.length; i++)
      expect(numbers[i]! > numbers[i - 1]!).toBe(true)
  } finally {
    await server.close()
  }
})

test('onBlock: receives the previous block', async () => {
  const server = await blockServer([1n, 2n])
  try {
    const seqClient = Client.create({
      transport: http(server.url),
      pollingInterval: 50,
    })

    const pairs: (bigint | undefined)[][] = []
    const watch = Actions.block.watch(seqClient)
    watch.onBlock((block, prevBlock) =>
      pairs.push([block.number!, prevBlock?.number]),
    )

    await wait(200)
    watch.off()

    expect(pairs[0]![1]).toBeUndefined()
    const last = pairs.at(-1)!
    expect(last[1]).toBe(last[0]! - 1n)
  } finally {
    await server.close()
  }
})

test('multiple listeners: all receive blocks; unregister is scoped', async () => {
  const server = await blockServer([1n, 2n, 3n])
  try {
    const seqClient = Client.create({
      transport: http(server.url),
      pollingInterval: 50,
    })
    const a: bigint[] = []
    const b: bigint[] = []

    const watch = Actions.block.watch(seqClient)
    const offA = watch.onBlock((block) => a.push(block.number!))
    watch.onBlock((block) => b.push(block.number!))

    await wait(120)
    offA()
    const aAfter = a.length
    await wait(120)
    watch.off()

    expect(a.length).toBeGreaterThanOrEqual(1)
    expect(b.length).toBeGreaterThanOrEqual(1)
    expect(a.length).toBe(aAfter)
    expect(b.length).toBeGreaterThan(aAfter)
  } finally {
    await server.close()
  }
})

test('emitMissed: backfills skipped blocks', async () => {
  // Drive the block number directly so the watcher observes a multi-block jump
  // (1 -> 5) deterministically, independent of concurrent mining.
  const server = await blockServer([1n, 5n])
  try {
    const missedClient = Client.create({
      transport: http(server.url),
      pollingInterval: 50,
    })

    const numbers: bigint[] = []
    const watch = Actions.block.watch(missedClient, { emitMissed: true })
    watch.onBlock((block) => numbers.push(block.number!))

    await wait(250)
    watch.off()

    expect(numbers).toEqual([1n, 2n, 3n, 4n, 5n])
  } finally {
    await server.close()
  }
})

test('polling: skips blocks that do not advance', async () => {
  // Return a higher block number, then a lower one (a reorg the watcher must
  // ignore rather than emit a backwards block).
  const server = await blockServer([5n, 3n])
  try {
    const reorgClient = Client.create({
      transport: http(server.url),
      pollingInterval: 50,
    })

    const numbers: bigint[] = []
    const watch = Actions.block.watch(reorgClient)
    watch.onBlock((block) => numbers.push(block.number!))

    await wait(250)
    watch.off()

    expect(numbers).toEqual([5n])
  } finally {
    await server.close()
  }
})

test('emitOnBegin: emits the latest block immediately', async () => {
  const server = await blockServer([42n])
  try {
    const seqClient = Client.create({
      transport: http(server.url),
      pollingInterval: 1_000,
    })

    const numbers: bigint[] = []
    const watch = Actions.block.watch(seqClient, { emitOnBegin: true })
    watch.onBlock((block) => numbers.push(block.number!))

    await wait(100)
    watch.off()

    expect(numbers[0]).toBe(42n)
  } finally {
    await server.close()
  }
})

test('includeTransactions: requests full transaction objects', async () => {
  let includeTransactions: boolean | undefined
  const server = await Http.createServer((req, res) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      const request = JSON.parse(body)
      if (request.method === 'eth_getBlockByNumber')
        includeTransactions = request.params?.[1]
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          id: request.id,
          jsonrpc: '2.0',
          result: { ...makeBlock(1n), transactions: [] },
        }),
      )
    })
  })
  try {
    const seqClient = Client.create({
      transport: http(server.url),
      pollingInterval: 50,
    })

    const watch = Actions.block.watch(seqClient, {
      emitOnBegin: true,
      includeTransactions: true,
    })
    await new Promise<void>((resolve) => watch.onBlock(() => resolve()))
    watch.off()

    expect(includeTransactions).toBe(true)
  } finally {
    await server.close()
  }
})

test('off: is idempotent and terminal', async () => {
  const server = await blockServer([1n, 2n, 3n])
  try {
    const seqClient = Client.create({
      transport: http(server.url),
      pollingInterval: 50,
    })

    const numbers: bigint[] = []
    const watch = Actions.block.watch(seqClient)
    watch.onBlock((block) => numbers.push(block.number!))

    await wait(50)
    watch.off()
    watch.off() // second call is a no-op

    // Re-registering after `off` is a no-op and never fires.
    const fired: bigint[] = []
    const offBlock = watch.onBlock((block) => fired.push(block.number!))
    const offError = watch.onError(() => fired.push(-1n))
    offBlock()
    offError()

    await wait(150)

    expect(fired).toEqual([])
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
    const watch = Actions.block.watch(bad)
    watch.onBlock(() => {})
    watch.onError((error) => {
      watch.off()
      resolve(error)
    })
  })

  expect(error).toBeInstanceOf(Error)
})

test('subscription: emits incoming blocks via a websocket', async () => {
  const server = await subscriptionServer([
    { number: '0x1' },
    { number: '0x2' },
  ])
  try {
    const wsClient = Client.create({
      transport: webSocket(server.url, { keepAlive: false, reconnect: false }),
    })

    const numbers: bigint[] = []
    const watch = Actions.block.watch(wsClient)
    watch.onBlock((block) => numbers.push(block.number!))

    await wait(200)
    watch.off()
    ;(await wsClient.transport.getRpcClient()).close()

    expect(numbers).toEqual([1n, 2n])
  } finally {
    await server.close()
  }
})

test('subscription: emitOnBegin emits the latest block immediately', async () => {
  const server = await subscriptionServer([{ number: '0x2' }], {
    latest: makeBlock(1n),
  })
  try {
    const wsClient = Client.create({
      transport: webSocket(server.url, { keepAlive: false, reconnect: false }),
    })

    const numbers: bigint[] = []
    const watch = Actions.block.watch(wsClient, { emitOnBegin: true })
    watch.onBlock((block) => numbers.push(block.number!))

    await wait(200)
    watch.off()
    ;(await wsClient.transport.getRpcClient()).close()

    expect(numbers).toContain(1n)
    expect(numbers).toContain(2n)
  } finally {
    await server.close()
  }
})

test('subscription: emitOnBegin forwards fetch errors', async () => {
  const server = await subscriptionServer([], { latest: null })
  try {
    const wsClient = Client.create({
      transport: webSocket(server.url, { keepAlive: false, reconnect: false }),
    })

    const error = await new Promise<Error>((resolve) => {
      const watch = Actions.block.watch(wsClient, { emitOnBegin: true })
      watch.onBlock(() => {})
      watch.onError((error) => {
        watch.off()
        resolve(error)
      })
    })
    ;(await wsClient.transport.getRpcClient()).close()

    expect(error).toBeInstanceOf(Error)
  } finally {
    await server.close()
  }
})

test('subscription: resolves subscribe from a fallback transport', async () => {
  const server = await subscriptionServer([{ number: '0x1' }])
  try {
    const fallbackClient = Client.create({
      transport: fallback([
        webSocket(server.url, { keepAlive: false, reconnect: false }),
        http('http://127.0.0.1:1'),
      ]),
    })

    const numbers: bigint[] = []
    const watch = Actions.block.watch(fallbackClient)
    watch.onBlock((block) => numbers.push(block.number!))

    await wait(200)
    watch.off()
    const { transports } = fallbackClient.transport as unknown as {
      transports: readonly { getRpcClient(): Promise<{ close(): void }> }[]
    }
    ;(await transports[0]!.getRpcClient()).close()

    expect(numbers).toEqual([1n])
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
      const watch = Actions.block.watch(wsClient)
      watch.onBlock(() => {})
      watch.onError((error) => resolve(error))
      wait(100).then(() => server.dropAll())
    })

    expect(error).toBeInstanceOf(Error)
  } finally {
    await server.close()
  }
})

test('subscription: invokes onError when subscribing fails', async () => {
  const bad = Client.create({
    transport: webSocket('ws://127.0.0.1:1', {
      keepAlive: false,
      reconnect: false,
    }),
  })

  const error = await new Promise<Error>((resolve) => {
    const watch = Actions.block.watch(bad)
    watch.onBlock(() => {})
    watch.onError((error) => {
      watch.off()
      resolve(error)
    })
  })

  expect(error).toBeInstanceOf(Error)
})

test('subscription: drops buffered blocks after off', async () => {
  const server = await subscriptionServer([{ number: '0x1' }])
  try {
    const wsClient = Client.create({
      transport: webSocket(server.url, { keepAlive: false, reconnect: false }),
    })

    const numbers: bigint[] = []
    const watch = Actions.block.watch(wsClient)
    watch.onBlock((block) => numbers.push(block.number!))
    watch.off()

    await wait(200)
    ;(await wsClient.transport.getRpcClient()).close()

    expect(numbers).toEqual([])
  } finally {
    await server.close()
  }
})

test('subscription: skips incomplete heads and failed block fetches', async () => {
  const server = await subscriptionServer(
    [{}, { number: '0x1' }, { number: '0x2' }],
    { '0x1': null },
  )
  try {
    const wsClient = Client.create({
      transport: webSocket(server.url, { keepAlive: false, reconnect: false }),
    })

    const numbers: bigint[] = []
    const watch = Actions.block.watch(wsClient)
    watch.onBlock((block) => numbers.push(block.number!))

    await wait(200)
    watch.off()
    ;(await wsClient.transport.getRpcClient()).close()

    expect(numbers).toEqual([2n])
  } finally {
    await server.close()
  }
})

test('async iterator: yields incoming blocks', async () => {
  const server = await subscriptionServer()
  try {
    const wsClient = Client.create({
      transport: webSocket(server.url, { keepAlive: false, reconnect: false }),
    })

    const watch = Actions.block.watch(wsClient)
    const iterator = watch[Symbol.asyncIterator]()

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
    expect(first.value!.block.number).toBe(1n)

    await iterator.return!()
    watch.off()
    ;(await wsClient.transport.getRpcClient()).close()
  } finally {
    await server.close()
  }
})

test('async iterator: off() resolves a pending next() as done', async () => {
  const server = await subscriptionServer()
  try {
    const wsClient = Client.create({
      transport: webSocket(server.url, { keepAlive: false, reconnect: false }),
    })

    const watch = Actions.block.watch(wsClient)
    const iterator = watch[Symbol.asyncIterator]()

    const next = iterator.next()
    watch.off()

    expect(await next).toEqual({ done: true, value: undefined })
    ;(await wsClient.transport.getRpcClient()).close()
  } finally {
    await server.close()
  }
})

test('async iterator: keeps only the latest buffered block', async () => {
  const server = await subscriptionServer([
    { number: '0x1' },
    { number: '0x5' },
  ])
  try {
    const wsClient = Client.create({
      transport: webSocket(server.url, { keepAlive: false, reconnect: false }),
    })

    const watch = Actions.block.watch(wsClient)
    const iterator = watch[Symbol.asyncIterator]()

    await wait(200)
    const result = await iterator.next()
    expect(result.value!.block.number).toBe(5n)
    expect(result.value!.prevBlock?.number).toBe(1n)
    expect(iterator[Symbol.asyncIterator]()).toBe(iterator)
    expect(await iterator.return!()).toEqual({ done: true, value: undefined })
    expect(await iterator.next()).toEqual({ done: true, value: undefined })
    watch.off()
    ;(await wsClient.transport.getRpcClient()).close()
  } finally {
    await server.close()
  }
})

test('async iterator: throws a stored subscription error', async () => {
  const server = await subscriptionServer()
  try {
    const wsClient = Client.create({
      transport: webSocket(server.url, { keepAlive: false, reconnect: false }),
    })

    const watch = Actions.block.watch(wsClient)
    const iterator = watch[Symbol.asyncIterator]()

    await waitForSubscription(server)
    server.dropAll()
    await wait(150)

    await expect(iterator.next()).rejects.toBeInstanceOf(Error)
    watch.off()
    ;(await wsClient.transport.getRpcClient()).close()
  } finally {
    await server.close()
  }
})

test('async iterator: rejects a pending next on error', async () => {
  const server = await subscriptionServer()
  try {
    const wsClient = Client.create({
      transport: webSocket(server.url, { keepAlive: false, reconnect: false }),
    })

    const watch = Actions.block.watch(wsClient)
    const iterator = watch[Symbol.asyncIterator]()

    await waitForSubscription(server)
    const next = iterator.next()
    server.dropAll()

    await expect(next).rejects.toBeInstanceOf(Error)
    watch.off()
    ;(await wsClient.transport.getRpcClient()).close()
  } finally {
    await server.close()
  }
})

test('smoke: emits incoming blocks from a live node', async () => {
  const blocks: bigint[] = []
  const watch = Actions.block.watch(client)
  watch.onBlock((block) => blocks.push(block.number!))

  try {
    await wait(150)
    await testClient.block.mine({ blocks: 1 })
    await expect
      .poll(() => blocks.length, { interval: 50, timeout: 2_000 })
      .toBeGreaterThanOrEqual(1)
  } finally {
    watch.off()
  }
})
