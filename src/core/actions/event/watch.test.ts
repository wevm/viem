import { AbiEvent, AbiParameters, Address, Hex } from 'ox'
import { expect, test } from 'vitest'

import { Actions, Client, http, publicActions, webSocket } from 'viem'

import * as constants from '~test/constants.js'
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
      event: transferEvent,
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
