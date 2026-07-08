import type { Hex } from 'ox'
import { expect, test } from 'vitest'

import { Actions, Client, http, webSocket } from 'viem'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
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
