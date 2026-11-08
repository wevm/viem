import { AbiEvent, AbiParameters, Address, Hex } from 'ox'
import { describe, expect, test } from 'vitest'

import { Actions, Client, http, publicActions, webSocket } from 'viem'

import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as contract from '~test/contract.js'
import * as Http from '~test/http.js'
import * as Ws from '~test/ws.js'
import { wait } from '../../internal/wait.js'

const a = constants.accounts[0].address
const b = constants.accounts[1].address
const address = '0xfba3912ca04dd458c843e2ee08967fc04f3579c2'

const transferEvent = AbiEvent.from(
  'event Transfer(address indexed from, address indexed to, uint256 value)',
)

// Builds a well-formed RPC `Transfer` log so deterministic servers can stream
// logs the watcher will decode without touching a live node.
function makeLog(
  from: Hex.Hex,
  to: Hex.Hex,
  value: bigint,
  options: { blockNumber: bigint; logIndex: number },
) {
  const { blockNumber, logIndex } = options
  return {
    address,
    topics: AbiEvent.encode(transferEvent, { from, to }).topics,
    data: AbiParameters.encode([{ type: 'uint256' }], [value]),
    blockHash: `0x${'ab'.repeat(32)}`,
    blockNumber: Hex.fromNumber(blockNumber),
    logIndex: Hex.fromNumber(logIndex),
    transactionHash: `0x${'cd'.repeat(32)}`,
    transactionIndex: Hex.fromNumber(0),
    removed: false,
  }
}

// Serves an event-filter lifecycle (`eth_newFilter` -> `eth_getFilterChanges`
// -> `eth_uninstallFilter`). The first changes poll returns `logs`, subsequent
// polls return nothing, so the watcher emits a deterministic single batch.
function filterServer(logs: readonly ReturnType<typeof makeLog>[]) {
  let polls = 0
  return Http.createServer((req, res) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      const request = JSON.parse(body)
      const result = (() => {
        if (request.method === 'eth_newFilter') return '0x1'
        if (request.method === 'eth_uninstallFilter') return true
        if (request.method === 'eth_getFilterChanges')
          return polls++ === 0 ? logs : []
        return null
      })()
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ id: request.id, jsonrpc: '2.0', result }))
    })
  })
}

// Serves an `eth_subscribe` ack over `logs`, then pushes the given RPC logs.
function subscriptionServer(logs: readonly ReturnType<typeof makeLog>[] = []) {
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
    for (const log of logs)
      connection.send(
        JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_subscription',
          params: { subscription: subscriptionId, result: log },
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

function expiringFilterServer(logs: readonly ReturnType<typeof makeLog>[]) {
  let emitted = false
  let installs = 0
  let polls = 0
  return {
    get installs() {
      return installs
    },
    get polls() {
      return polls
    },
    server: Http.createServer((req, res) => {
      let body = ''
      req.on('data', (chunk) => {
        body += chunk
      })
      req.on('end', () => {
        const request = JSON.parse(body)
        res.setHeader('Content-Type', 'application/json')
        if (request.method === 'eth_getFilterChanges' && polls < 2) {
          const code = polls++ === 0 ? -32001 : -32000
          res.end(
            JSON.stringify({
              id: request.id,
              jsonrpc: '2.0',
              error: { code, message: 'filter unavailable' },
            }),
          )
          return
        }
        const result = (() => {
          if (request.method === 'eth_newFilter')
            return Hex.fromNumber(++installs)
          if (request.method === 'eth_getFilterChanges') {
            polls++
            if (emitted) return []
            emitted = true
            return logs
          }
          if (request.method === 'eth_uninstallFilter') return true
          return null
        })()
        res.end(JSON.stringify({ id: request.id, jsonrpc: '2.0', result }))
      })
    }),
  }
}

test('default: emits decoded logs via polling', async () => {
  const server = await filterServer([
    makeLog(a, b, 1n, { blockNumber: 1n, logIndex: 0 }),
  ])
  try {
    const seqClient = Client.create({
      transport: http(server.url),
      pollingInterval: 50,
    })

    const names: string[] = []
    const watch = Actions.event.watch(seqClient, {
      address,
      event: transferEvent,
    })
    watch.onLogs((logs) => {
      for (const log of logs) names.push(log.eventName)
    })

    await wait(200)
    watch.off()

    expect(names.length).toBeGreaterThanOrEqual(1)
    expect(names[0]).toBe('Transfer')
  } finally {
    await server.close()
  }
})

test('args: filters by indexed argument', async () => {
  // Serve a non-matching (from=b) and a matching (from=a) log; the watcher must
  // decode and keep only the one matching `args.from`.
  const server = await filterServer([
    makeLog(b, a, 1n, { blockNumber: 1n, logIndex: 0 }),
    makeLog(a, b, 1n, { blockNumber: 1n, logIndex: 1 }),
  ])
  try {
    const seqClient = Client.create({
      transport: http(server.url),
      pollingInterval: 50,
    })

    const froms: (string | undefined)[] = []
    const watch = Actions.event.watch(seqClient, {
      address,
      args: { from: a },
      event: transferEvent,
    })
    watch.onLogs((logs) => {
      for (const log of logs) froms.push(log.args.from)
    })

    await wait(200)
    watch.off()

    expect(froms.length).toBeGreaterThanOrEqual(1)
    for (const from of froms) expect(from).toBe(Address.checksum(a))
  } finally {
    await server.close()
  }
})

test('batch: false emits one log per call', async () => {
  const server = await filterServer([
    makeLog(a, b, 1n, { blockNumber: 1n, logIndex: 0 }),
    makeLog(a, b, 2n, { blockNumber: 1n, logIndex: 1 }),
  ])
  try {
    const seqClient = Client.create({
      transport: http(server.url),
      pollingInterval: 50,
    })

    const sizes: number[] = []
    const watch = Actions.event.watch(seqClient, {
      address,
      batch: false,
      event: transferEvent,
    })
    watch.onLogs((logs) => sizes.push(logs.length))

    await wait(200)
    watch.off()

    expect(sizes.length).toBe(2)
    for (const size of sizes) expect(size).toBe(1)
  } finally {
    await server.close()
  }
})

test('batch: true emits a single batch', async () => {
  const server = await filterServer([
    makeLog(a, b, 1n, { blockNumber: 1n, logIndex: 0 }),
    makeLog(a, b, 2n, { blockNumber: 1n, logIndex: 1 }),
  ])
  try {
    const seqClient = Client.create({
      transport: http(server.url),
      pollingInterval: 50,
    })

    const sizes: number[] = []
    const watch = Actions.event.watch(seqClient, {
      address,
      event: transferEvent,
    })
    watch.onLogs((logs) => sizes.push(logs.length))

    await wait(200)
    watch.off()

    expect(sizes).toEqual([2])
  } finally {
    await server.close()
  }
})

test('onError: invokes the listener when polling fails', async () => {
  const bad = Client.create({
    transport: http('http://127.0.0.1:1'),
    pollingInterval: 100,
  })

  const error = await new Promise<Error>((resolve) => {
    const watch = Actions.event.watch(bad, { event: transferEvent })
    watch.onLogs(() => {})
    watch.onError((error) => {
      watch.off()
      resolve(error)
    })
  })

  expect(error).toBeInstanceOf(Error)
})

test('off: stops polling when the filter uninstall fails', async () => {
  // Serves the filter lifecycle but rejects `eth_uninstallFilter`; the failed
  // uninstall must not keep the changes poll alive after `off`.
  let polls = 0
  const server = await Http.createServer((req, res) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      const request = JSON.parse(body)
      res.setHeader('Content-Type', 'application/json')
      if (request.method === 'eth_uninstallFilter') {
        res.end(
          JSON.stringify({
            id: request.id,
            jsonrpc: '2.0',
            error: { code: -32000, message: 'filter not found' },
          }),
        )
        return
      }
      const result = (() => {
        if (request.method === 'eth_newFilter') return '0x1'
        if (request.method === 'eth_getFilterChanges') {
          polls++
          return []
        }
        return null
      })()
      res.end(JSON.stringify({ id: request.id, jsonrpc: '2.0', result }))
    })
  })
  try {
    const seqClient = Client.create({
      transport: http(server.url, { retryCount: 0 }),
      pollingInterval: 50,
    })

    const watch = Actions.event.watch(seqClient, {
      address,
      event: transferEvent,
    })
    watch.onLogs(() => {})

    await wait(200)
    watch.off()

    // Allow the in-flight tick and the failed uninstall to settle, then
    // verify no further changes polls arrive.
    await wait(150)
    const settled = polls
    await wait(300)
    expect(polls).toBe(settled)
  } finally {
    await server.close()
  }
})

test('subscription: emits decoded logs via a websocket', async () => {
  const server = await subscriptionServer([
    makeLog(a, b, 1n, { blockNumber: 1n, logIndex: 0 }),
  ])
  try {
    const wsClient = Client.create({
      transport: webSocket(server.url, { keepAlive: false, reconnect: false }),
    })

    const names: string[] = []
    const watch = Actions.event.watch(wsClient, {
      address,
      events: [transferEvent],
    })
    watch.onLogs((logs) => {
      for (const log of logs) names.push(log.eventName)
    })

    await wait(200)
    watch.off()
    ;(await wsClient.transport.getRpcClient()).close()

    expect(names).toEqual(['Transfer'])
  } finally {
    await server.close()
  }
})

test('subscription: emits raw logs without an event', async () => {
  const server = await subscriptionServer([
    makeLog(a, b, 1n, { blockNumber: 1n, logIndex: 0 }),
  ])
  try {
    const wsClient = Client.create({
      transport: webSocket(server.url, { keepAlive: false, reconnect: false }),
    })

    const watch = Actions.event.watch(wsClient, { address })
    const logs = await new Promise<readonly { address: string }[]>((resolve) =>
      watch.onLogs(resolve),
    )
    watch.off()
    ;(await wsClient.transport.getRpcClient()).close()

    expect(logs[0]!.address).toBe(address)
  } finally {
    await server.close()
  }
})

test('subscription: ignores nonmatching logs', async () => {
  const server = await subscriptionServer([
    makeLog(a, b, 1n, { blockNumber: 1n, logIndex: 0 }),
  ])
  try {
    const wsClient = Client.create({
      transport: webSocket(server.url, { keepAlive: false, reconnect: false }),
    })

    const values: bigint[] = []
    const watch = Actions.event.watch(wsClient, {
      address,
      args: { from: b },
      event: transferEvent,
    })
    watch.onLogs((logs) => {
      for (const log of logs) values.push(log.args.value!)
    })

    await wait(200)
    watch.off()
    ;(await wsClient.transport.getRpcClient()).close()

    expect(values).toEqual([])
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
    const watch = Actions.event.watch(bad, { event: transferEvent })
    watch.onLogs(() => {})
    watch.onError((error) => {
      watch.off()
      resolve(error)
    })
  })

  expect(error).toBeInstanceOf(Error)
})

test('subscription: drops buffered logs after off', async () => {
  const server = await subscriptionServer([
    makeLog(a, b, 1n, { blockNumber: 1n, logIndex: 0 }),
  ])
  try {
    const wsClient = Client.create({
      transport: webSocket(server.url, { keepAlive: false, reconnect: false }),
    })

    const values: bigint[] = []
    const watch = Actions.event.watch(wsClient, { event: transferEvent })
    watch.onLogs((logs) => {
      for (const log of logs) values.push(log.args.value!)
    })
    watch.off()

    await wait(200)
    ;(await wsClient.transport.getRpcClient()).close()

    expect(values).toEqual([])
  } finally {
    await server.close()
  }
})

test('polling: reinstalls an expired filter', async () => {
  const fixture = expiringFilterServer([
    makeLog(a, b, 3n, { blockNumber: 1n, logIndex: 0 }),
  ])
  const server = await fixture.server
  try {
    const seqClient = Client.create({
      transport: http(server.url, { retryCount: 0 }),
      pollingInterval: 25,
    })

    const errors: Error[] = []
    const values: bigint[] = []
    const watch = Actions.event.watch(seqClient, { event: transferEvent })
    watch.onLogs((logs) => {
      for (const log of logs) values.push(log.args.value!)
    })
    watch.onError((error) => errors.push(error))

    await expect
      .poll(() => values, { interval: 25, timeout: 2_000 })
      .toEqual([3n])
    watch.off()

    expect(errors).toHaveLength(2)
    expect(fixture.installs).toBe(2)
    expect(fixture.polls).toBeGreaterThanOrEqual(3)
  } finally {
    await server.close()
  }
})

test('polling: falls back to block-range log queries', async () => {
  let query: { fromBlock?: string; toBlock?: string } | undefined
  const server = await Http.createServer((req, res) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      const request = JSON.parse(body)
      res.setHeader('Content-Type', 'application/json')
      if (request.method === 'eth_newFilter') {
        res.end(
          JSON.stringify({
            id: request.id,
            jsonrpc: '2.0',
            error: { code: -32601, message: 'method not found' },
          }),
        )
        return
      }
      const result = (() => {
        if (request.method === 'eth_blockNumber') return '0x1'
        if (request.method === 'eth_getLogs') {
          query = request.params[0]
          return [makeLog(a, b, 4n, { blockNumber: 1n, logIndex: 0 })]
        }
        return null
      })()
      res.end(JSON.stringify({ id: request.id, jsonrpc: '2.0', result }))
    })
  })
  try {
    const seqClient = Client.create({
      transport: http(server.url, { retryCount: 0 }),
      pollingInterval: 25,
    })

    const values: bigint[] = []
    const watch = Actions.event.watch(seqClient, {
      event: transferEvent,
      fromBlock: 1n,
    })
    watch.onLogs((logs) => {
      for (const log of logs) values.push(log.args.value!)
    })

    await expect
      .poll(() => values, { interval: 25, timeout: 2_000 })
      .toEqual([4n])
    await wait(50)
    watch.off()

    expect(query).toEqual({
      address: undefined,
      fromBlock: '0x1',
      toBlock: '0x1',
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      ],
    })
  } finally {
    await server.close()
  }
})

// Serves a node without filter support. `getBlockNumber` returns the block
// number for each `eth_blockNumber` poll, and `getLogs` replies to each
// `eth_getLogs` range (or returns an RPC error or HTTP status to fail it).
function getLogsServer(options: {
  getBlockNumber: () => bigint
  getLogs: (
    from: bigint,
    to: bigint,
  ) => readonly unknown[] | { code: number } | { status: number }
}) {
  const { getBlockNumber, getLogs } = options
  const queries: (readonly [bigint, bigint])[] = []
  return {
    queries,
    server: Http.createServer((req, res) => {
      let body = ''
      req.on('data', (chunk) => {
        body += chunk
      })
      req.on('end', () => {
        const request = JSON.parse(body)
        const reply = (() => {
          if (request.method === 'eth_newFilter')
            return { error: { code: -32601, message: 'method not found' } }
          if (request.method === 'eth_blockNumber')
            return { result: Hex.fromNumber(getBlockNumber()) }
          if (request.method === 'eth_getLogs') {
            const { fromBlock, toBlock } = request.params[0]
            const from = Hex.toBigInt(fromBlock)
            const to = Hex.toBigInt(toBlock)
            queries.push([from, to])
            const result = getLogs(from, to)
            if ('status' in result) return result
            if ('code' in result)
              return { error: { code: result.code, message: 'failed' } }
            return { result }
          }
          return { result: null }
        })()
        if ('status' in reply) {
          res.statusCode = reply.status as number
          res.setHeader('Content-Type', 'text/plain')
          res.end('request failed')
          return
        }
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ id: request.id, jsonrpc: '2.0', ...reply }))
      })
    }),
  }
}

// Returns one `Transfer` log per block in the range, valued by its block number.
function logsInRange(from: bigint, to: bigint) {
  const logs = []
  for (let block = from; block <= to; block++)
    logs.push(makeLog(a, b, block, { blockNumber: block, logIndex: 0 }))
  return logs
}

describe('polling: getLogs fallback', () => {
  test('splits block ranges the RPC Provider rejects', async () => {
    const fixture = getLogsServer({
      getBlockNumber: () => 8n,
      getLogs: (from, to) =>
        to - from >= 2n ? { code: -32005 } : logsInRange(from, to),
    })
    const server = await fixture.server
    try {
      const seqClient = Client.create({
        transport: http(server.url, { retryCount: 0 }),
        pollingInterval: 25,
      })

      const values: bigint[] = []
      const watch = Actions.event.watch(seqClient, {
        event: transferEvent,
        fromBlock: 1n,
      })
      watch.onLogs((logs) => {
        for (const log of logs) values.push(log.args.value!)
      })

      await expect
        .poll(() => values, { interval: 25, timeout: 2_000 })
        .toHaveLength(8)
      watch.off()

      expect({ queries: fixture.queries, values }).toMatchInlineSnapshot(`
        {
          "queries": [
            [
              1n,
              8n,
            ],
            [
              1n,
              4n,
            ],
            [
              1n,
              2n,
            ],
            [
              3n,
              4n,
            ],
            [
              5n,
              6n,
            ],
            [
              7n,
              8n,
            ],
          ],
          "values": [
            1n,
            2n,
            3n,
            4n,
            5n,
            6n,
            7n,
            8n,
          ],
        }
      `)
    } finally {
      await server.close()
    }
  })

  test('reports one error when a single block fails, then resumes from it', async () => {
    let failures = 1
    const fixture = getLogsServer({
      getBlockNumber: () => 3n,
      getLogs: (from, to) => {
        if (from <= 2n && to >= 2n && failures > 0) {
          if (from === to) failures--
          return { code: -32005 }
        }
        return logsInRange(from, to)
      },
    })
    const server = await fixture.server
    try {
      const seqClient = Client.create({
        transport: http(server.url, { retryCount: 0 }),
        pollingInterval: 25,
      })

      const errors: string[] = []
      const values: bigint[] = []
      const watch = Actions.event.watch(seqClient, {
        event: transferEvent,
        fromBlock: 1n,
      })
      watch.onLogs((logs) => {
        for (const log of logs) values.push(log.args.value!)
      })
      watch.onError((error) => errors.push(error.name))

      await expect
        .poll(() => values, { interval: 25, timeout: 2_000 })
        .toHaveLength(3)
      watch.off()

      expect({ errors, values }).toMatchInlineSnapshot(`
        {
          "errors": [
            "RpcResponse.LimitExceededError",
          ],
          "values": [
            1n,
            2n,
            3n,
          ],
        }
      `)
    } finally {
      await server.close()
    }
  })

  test('does not split block ranges when rate limited', async () => {
    const fixture = getLogsServer({
      getBlockNumber: () => 8n,
      getLogs: () => ({ status: 429 }),
    })
    const server = await fixture.server
    try {
      const seqClient = Client.create({
        transport: http(server.url, { retryCount: 0 }),
        pollingInterval: 25,
      })

      const error = await new Promise<Error>((resolve) => {
        const watch = Actions.event.watch(seqClient, {
          event: transferEvent,
          fromBlock: 1n,
        })
        watch.onLogs(() => {})
        watch.onError((error) => {
          watch.off()
          resolve(error)
        })
      })

      expect({ name: error.name, queries: fixture.queries })
        .toMatchInlineSnapshot(`
        {
          "name": "RpcClient.HttpError",
          "queries": [
            [
              1n,
              8n,
            ],
          ],
        }
      `)
    } finally {
      await server.close()
    }
  })

  test('does not repeat logs when the RPC Provider reports a lower block number', async () => {
    const blockNumbers = [2n, 4n, 3n, 5n]
    let index = 0
    const fixture = getLogsServer({
      getBlockNumber: () =>
        blockNumbers[Math.min(index++, blockNumbers.length - 1)]!,
      getLogs: logsInRange,
    })
    const server = await fixture.server
    try {
      const seqClient = Client.create({
        transport: http(server.url, { retryCount: 0 }),
        pollingInterval: 25,
      })

      const values: bigint[] = []
      const watch = Actions.event.watch(seqClient, { event: transferEvent })
      watch.onLogs((logs) => {
        for (const log of logs) values.push(log.args.value!)
      })

      await expect
        .poll(() => values, { interval: 25, timeout: 2_000 })
        .toHaveLength(3)
      await wait(100)
      watch.off()

      expect(values).toMatchInlineSnapshot(`
        [
          3n,
          4n,
          5n,
        ]
      `)
    } finally {
      await server.close()
    }
  })

  test('does not emit logs before a `fromBlock` past the latest block', async () => {
    let blockNumber = 5n
    const fixture = getLogsServer({
      getBlockNumber: () => blockNumber,
      getLogs: logsInRange,
    })
    const server = await fixture.server
    try {
      const seqClient = Client.create({
        transport: http(server.url, { retryCount: 0 }),
        pollingInterval: 25,
      })

      const values: bigint[] = []
      const watch = Actions.event.watch(seqClient, {
        event: transferEvent,
        fromBlock: 10n,
      })
      watch.onLogs((logs) => {
        for (const log of logs) values.push(log.args.value!)
      })

      await wait(100)
      blockNumber = 11n
      await expect
        .poll(() => values, { interval: 25, timeout: 2_000 })
        .toHaveLength(2)
      watch.off()

      expect({ queries: fixture.queries, values }).toMatchInlineSnapshot(`
        {
          "queries": [
            [
              10n,
              11n,
            ],
          ],
          "values": [
            10n,
            11n,
          ],
        }
      `)
    } finally {
      await server.close()
    }
  })

  test('reads blocks from a `fromBlock` of 0 or 1', async () => {
    const results: Record<string, unknown> = {}
    for (const fromBlock of [0n, 1n, 2n]) {
      const fixture = getLogsServer({
        getBlockNumber: () => 5n,
        getLogs: () => [makeLog(a, b, 1n, { blockNumber: 3n, logIndex: 0 })],
      })
      const server = await fixture.server
      try {
        const seqClient = Client.create({
          transport: http(server.url, { retryCount: 0 }),
          pollingInterval: 25,
        })

        const blockNumbers: (bigint | null)[] = []
        const watch = Actions.event.watch(seqClient, {
          event: transferEvent,
          fromBlock,
        })
        watch.onLogs((logs) => {
          for (const log of logs) blockNumbers.push(log.blockNumber)
        })

        await expect
          .poll(() => blockNumbers, { interval: 25, timeout: 2_000 })
          .toHaveLength(1)
        watch.off()

        results[`fromBlock: ${fromBlock}`] = {
          blockNumbers,
          queries: fixture.queries,
        }
      } finally {
        await server.close()
      }
    }

    expect(results).toMatchInlineSnapshot(`
      {
        "fromBlock: 0": {
          "blockNumbers": [
            3n,
          ],
          "queries": [
            [
              0n,
              5n,
            ],
          ],
        },
        "fromBlock: 1": {
          "blockNumbers": [
            3n,
          ],
          "queries": [
            [
              1n,
              5n,
            ],
          ],
        },
        "fromBlock: 2": {
          "blockNumbers": [
            3n,
          ],
          "queries": [
            [
              2n,
              5n,
            ],
          ],
        },
      }
    `)
  })

  test('skips logs that do not match `event` when `strict: true`', async () => {
    const fixture = getLogsServer({
      getBlockNumber: () => 2n,
      getLogs: () => [
        { ...makeLog(a, b, 1n, { blockNumber: 1n, logIndex: 0 }), data: '0x' },
        makeLog(a, b, 2n, { blockNumber: 2n, logIndex: 0 }),
      ],
    })
    const server = await fixture.server
    try {
      const seqClient = Client.create({
        transport: http(server.url, { retryCount: 0 }),
        pollingInterval: 25,
      })

      const values: bigint[] = []
      const watch = Actions.event.watch(seqClient, {
        event: transferEvent,
        fromBlock: 1n,
        strict: true,
      })
      watch.onLogs((logs) => {
        for (const log of logs) values.push(log.args.value)
      })

      await expect
        .poll(() => values, { interval: 25, timeout: 2_000 })
        .toHaveLength(1)
      await wait(50)
      watch.off()

      expect(values).toMatchInlineSnapshot(`
        [
          2n,
        ]
      `)
    } finally {
      await server.close()
    }
  })
})

describe('polling: concurrent watchers', () => {
  const client = Client.create({
    pollingInterval: 50,
    transport: http(anvil.mainnet.rpcUrl.http),
  })
  const approvalEvent = AbiEvent.from(
    'event Approval(address indexed owner, address indexed spender, uint256 value)',
  )

  /**
   * Calls `functionName` on the contract at `address`, then mines it.
   * `EventsInvalid.emitTransfer` shares the selector of `Events.emitTransfer`.
   */
  async function emit(
    address: Address.Address,
    functionName: 'emitApproval' | 'emitTransfer',
  ) {
    await Actions.contract.write(client, {
      abi: generated.Events.abi,
      account: a,
      address,
      args: [a, b, 1n],
      functionName,
    })
    await Actions.block.mine(client, { blocks: 1 })
  }

  test('watchers of different events each receive their own logs', async () => {
    const { address } = await contract.deploy(client, {
      bytecode: generated.Events.bytecode.object,
    })
    const transfers: string[] = []
    const approvals: string[] = []

    const transferWatch = Actions.event.watch(client, {
      address,
      events: [transferEvent],
      poll: true,
    })
    transferWatch.onLogs((logs) => {
      for (const log of logs) transfers.push(log.eventName)
    })
    const approvalWatch = Actions.event.watch(client, {
      address,
      events: [approvalEvent],
      poll: true,
    })
    approvalWatch.onLogs((logs) => {
      for (const log of logs) approvals.push(log.eventName)
    })
    await wait(200)

    await emit(address, 'emitTransfer')
    await emit(address, 'emitApproval')
    await expect
      .poll(() => [...transfers, ...approvals], { timeout: 5_000 })
      .toHaveLength(2)
    await wait(200)
    transferWatch.off()
    approvalWatch.off()

    expect({ approvals, transfers }).toMatchInlineSnapshot(`
      {
        "approvals": [
          "Approval",
        ],
        "transfers": [
          "Transfer",
        ],
      }
    `)
  })

  test('watchers of the same event with and without `strict` filter independently', async () => {
    const { address } = await contract.deploy(client, {
      bytecode: generated.Events.bytecode.object,
    })
    // Emits `Transfer` with only `from` indexed.
    const { address: invalidAddress } = await contract.deploy(client, {
      bytecode: generated.EventsInvalid.bytecode.object,
    })
    const unstrict: Address.Address[] = []
    const strict: Address.Address[] = []

    const unstrictWatch = Actions.event.watch(client, {
      address: [address, invalidAddress],
      event: transferEvent,
      poll: true,
    })
    unstrictWatch.onLogs((logs) => {
      for (const log of logs) unstrict.push(log.address)
    })
    const strictWatch = Actions.event.watch(client, {
      address: [address, invalidAddress],
      event: transferEvent,
      poll: true,
      strict: true,
    })
    strictWatch.onLogs((logs) => {
      for (const log of logs) strict.push(log.address)
    })
    await wait(200)

    await emit(address, 'emitTransfer')
    await emit(invalidAddress, 'emitTransfer')
    await expect
      .poll(() => [...unstrict, ...strict], { timeout: 5_000 })
      .toHaveLength(3)
    await wait(200)
    unstrictWatch.off()
    strictWatch.off()

    expect({
      strict: strict.map((log) => Address.isEqual(log, address)),
      unstrict: unstrict.map((log) => Address.isEqual(log, address)),
    }).toMatchInlineSnapshot(`
      {
        "strict": [
          true,
        ],
        "unstrict": [
          true,
          false,
        ],
      }
    `)
  })
})

test('async iterator: yields decoded logs', async () => {
  const server = await subscriptionServer([
    makeLog(a, b, 1n, { blockNumber: 1n, logIndex: 0 }),
  ])
  try {
    const wsClient = Client.create({
      transport: webSocket(server.url, { keepAlive: false, reconnect: false }),
    })

    const watch = Actions.event.watch(wsClient, {
      address,
      event: transferEvent,
    })
    const iterator = watch[Symbol.asyncIterator]()

    const first = await iterator.next()
    expect(first.done).toBe(false)
    expect(first.value!.logs[0]!.eventName).toBe('Transfer')

    await iterator.return!()
    watch.off()
    ;(await wsClient.transport.getRpcClient()).close()
  } finally {
    await server.close()
  }
})

test('async iterator: keeps only the latest buffered log', async () => {
  const server = await subscriptionServer([
    makeLog(a, b, 1n, { blockNumber: 1n, logIndex: 0 }),
    makeLog(a, b, 2n, { blockNumber: 1n, logIndex: 1 }),
  ])
  try {
    const wsClient = Client.create({
      transport: webSocket(server.url, { keepAlive: false, reconnect: false }),
    })

    const watch = Actions.event.watch(wsClient, { event: transferEvent })
    const iterator = watch[Symbol.asyncIterator]()

    await wait(200)
    const result = await iterator.next()
    expect(result.value!.logs[0]!.args.value).toBe(2n)
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

    const watch = Actions.event.watch(wsClient, { event: transferEvent })
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

    const watch = Actions.event.watch(wsClient, { event: transferEvent })
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

test('async iterator: off resolves a pending next as done', async () => {
  const server = await subscriptionServer()
  try {
    const wsClient = Client.create({
      transport: webSocket(server.url, { keepAlive: false, reconnect: false }),
    })

    const watch = Actions.event.watch(wsClient, { event: transferEvent })
    const iterator = watch[Symbol.asyncIterator]()
    const next = iterator.next()
    watch.off()
    watch.off()
    watch.onLogs(() => {})()
    watch.onError(() => {})()

    expect(await next).toEqual({ done: true, value: undefined })
    ;(await wsClient.transport.getRpcClient()).close()
  } finally {
    await server.close()
  }
})

test('decorator', async () => {
  const server = await filterServer([
    makeLog(a, b, 1n, { blockNumber: 1n, logIndex: 0 }),
  ])
  try {
    const seqClient = Client.create({
      transport: http(server.url),
      pollingInterval: 50,
    }).extend(publicActions())

    let count = 0
    const watch = seqClient.event.watch({ address, event: transferEvent })
    watch.onLogs((logs) => {
      count += logs.length
    })

    await wait(200)
    watch.off()

    expect(count).toBe(1)
  } finally {
    await server.close()
  }
})
