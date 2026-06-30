import * as AbiEvent from 'ox/AbiEvent'
import * as AbiParameters from 'ox/AbiParameters'
import * as Hex from 'ox/Hex'
import { Actions, Client, http, publicActions, webSocket } from 'viem'
import { expect, test } from 'vitest'

import * as generated from '~contracts/generated.js'
import * as constants from '~test/constants.js'
import * as Http from '~test/http.js'
import * as Ws from '~test/ws.js'
import { wait } from '../../internal/wait.js'

const abi = generated.Events.abi

const a = constants.accounts[0].address
const b = constants.accounts[1].address
const address = '0xfba3912ca04dd458c843e2ee08967fc04f3579c2'

const transferEvent = AbiEvent.fromAbi(abi, 'Transfer')

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

// Serves an event-filter lifecycle; the first changes poll returns `logs`.
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
    const watch = Actions.contract.watchEvent(seqClient, {
      abi,
      address,
      eventName: 'Transfer',
    })
    watch.onLogs((logs) => {
      for (const log of logs) names.push(log.eventName)
    })

    await wait(200)
    watch.off()

    expect(names).toEqual(['Transfer'])
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
    const watch = Actions.contract.watchEvent(seqClient, {
      abi,
      address,
      batch: false,
      eventName: 'Transfer',
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

test('onError: invokes the listener when polling fails', async () => {
  const bad = Client.create({
    transport: http('http://127.0.0.1:1'),
    pollingInterval: 100,
  })

  const error = await new Promise<Error>((resolve) => {
    const watch = Actions.contract.watchEvent(bad, {
      abi,
      eventName: 'Transfer',
    })
    watch.onLogs(() => {})
    watch.onError((error) => {
      watch.off()
      resolve(error)
    })
  })

  expect(error).toBeInstanceOf(Error)
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
    const watch = Actions.contract.watchEvent(wsClient, {
      abi,
      address,
      eventName: 'Transfer',
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

    const watch = Actions.contract.watchEvent(wsClient, {
      abi,
      address,
      eventName: 'Transfer',
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
    const watch = seqClient.contract.watchEvent({
      abi,
      address,
      eventName: 'Transfer',
    })
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
