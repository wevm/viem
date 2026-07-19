import type { Hex } from 'ox'
import { expect, test } from 'vitest'

import { Actions, Client, http, webSocket } from 'viem'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as Http from '~test/http.js'
import { wait } from '../../internal/wait.js'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
  pollingInterval: 100,
})

const a = constants.accounts[0].address
const b = constants.accounts[1].address

test('default: emits pending transaction hashes via polling', async () => {
  const hashes: Hex.Hex[] = []
  const watch = Actions.transaction.watchPending(client)
  watch.onTransactions((next) => hashes.push(...next))

  await wait(200)
  const hash = await Actions.transaction.send(client, {
    account: a,
    to: b,
    value: 1n,
  })
  await wait(300)
  watch.off()

  expect(hashes).toContain(hash)
})

test('batch: false emits one hash per call', async () => {
  const batches: (readonly Hex.Hex[])[] = []
  const watch = Actions.transaction.watchPending(client, { batch: false })
  watch.onTransactions((next) => batches.push(next))

  await wait(200)
  await Actions.transaction.send(client, { account: a, to: b, value: 1n })
  await wait(300)
  watch.off()

  for (const batch of batches) expect(batch.length).toBe(1)
})

test('off: is idempotent and terminal', async () => {
  const hashes: Hex.Hex[] = []
  const watch = Actions.transaction.watchPending(client)
  watch.onTransactions((next) => hashes.push(...next))

  await wait(150)
  watch.off()
  watch.off() // second call is a no-op

  const fired: Hex.Hex[] = []
  const off = watch.onTransactions((next) => fired.push(...next))
  off()

  await Actions.transaction.send(client, { account: a, to: b, value: 1n })
  await wait(200)

  expect(fired).toEqual([])
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
        if (request.method === 'eth_newPendingTransactionFilter') return '0x1'
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

    const watch = Actions.transaction.watchPending(seqClient)
    watch.onTransactions(() => {})

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

test('onError: invokes the listener when polling fails', async () => {
  const bad = Client.create({
    transport: http('http://127.0.0.1:1'),
    pollingInterval: 100,
  })

  const error = await new Promise<Error>((resolve) => {
    const watch = Actions.transaction.watchPending(bad)
    watch.onTransactions(() => {})
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

  const hashes: Hex.Hex[] = []
  const watch = Actions.transaction.watchPending(wsClient)
  watch.onTransactions((next) => hashes.push(...next))

  await wait(200)
  const hash = await Actions.transaction.send(client, {
    account: a,
    to: b,
    value: 1n,
  })
  await wait(400)
  watch.off()
  ;(await wsClient.transport.getRpcClient()).close()

  expect(hashes).toContain(hash)
})
