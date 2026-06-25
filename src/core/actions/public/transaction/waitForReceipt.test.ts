import * as Value from 'ox/Value'
import { expect, test } from 'vitest'

import { Actions, Client, http, testActions } from 'viem'

import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as Http from '~test/http.js'
import { wait } from '../../../internal/wait.js'
import { WaitForReceiptTimeoutError } from './waitForReceipt.js'

const client = Client.create({
  transport: http(anvil.mainnet.rpcUrl.http),
  pollingInterval: 100,
})
const testClient = client.extend(testActions())

// A JSON-RPC server that forwards to the anvil fork (so every response is a
// real, valid wire shape) but lets a test override specific methods on specific
// calls. `intercept` returns `{ result }` / `{ error }` to override, or
// `undefined` to forward to anvil. This drives the not-found / retry / error
// branches deterministically without mocks.
function proxyServer(
  intercept: (
    method: string,
    callIndex: number,
  ) =>
    | { result?: unknown; error?: { code: number; message: string } }
    | undefined,
) {
  const counts: Record<string, number> = {}
  return Http.createServer(async (req, res) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', async () => {
      const request = JSON.parse(body)
      const requests = Array.isArray(request) ? request : [request]
      const responses = await Promise.all(
        requests.map(async (r) => {
          const index = (counts[r.method] = (counts[r.method] ?? 0) + 1) - 1
          const override = intercept(r.method, index)
          if (override)
            return { id: r.id, jsonrpc: '2.0' as const, ...override }
          const upstream = await fetch(anvil.mainnet.rpcUrl.http, {
            body: JSON.stringify(r),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
          })
          return { ...(await upstream.json()), id: r.id }
        }),
      )
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(Array.isArray(request) ? responses : responses[0]))
    })
  })
}

const source = constants.accounts[0]
const target = constants.accounts[1]
const to = target.address

// Mines `blocks` one at a time with a gap between each, so the receipt watcher
// gets a fresh tick once the receipt is queryable (it can briefly lag the head).
async function mineSlowly(blocks: number) {
  for (let i = 0; i < blocks; i++) {
    await testClient.block.mine({ blocks: 1 })
    await wait(150)
  }
}

// Replacement detection requires the watcher to observe the original (pending)
// transaction before it is replaced. Block until the node reports it in the
// pool (so the watcher's next tick can capture it), then add a small margin.
async function whenPendingObserved(hash: `0x${string}`) {
  while (true) {
    const found = await Actions.transaction
      .get(client, { hash })
      .then(() => true)
      .catch(() => false)
    if (found) break
    await wait(50)
  }
  await wait(600)
}

async function setup() {
  await testClient.address.setBalance({
    address: source.address,
    value: source.balance,
  })
  await testClient.address.setBalance({
    address: target.address,
    value: target.balance,
  })
  await testClient.block.setNextBaseFeePerGas({
    baseFeePerGas: Value.fromGwei('10'),
  })
  await testClient.block.mine({ blocks: 1 })
}

test('default: waits for a receipt (send -> mine -> wait)', async () => {
  await setup()
  const hash = await Actions.transaction.send(client, {
    account: source.address,
    to,
    value: Value.fromEther('1'),
  })
  await testClient.block.mine({ blocks: 1 })

  const receipt = await Actions.transaction.waitForReceipt(client, { hash })
    .receipt

  expect(receipt.status).toBe('success')
  expect(receipt.transactionHash).toBe(hash)
})

test('onReceipt: notifies a listener with the receipt', async () => {
  await setup()
  const hash = await Actions.transaction.send(client, {
    account: source.address,
    to,
    value: Value.fromEther('1'),
  })
  await testClient.block.mine({ blocks: 1 })

  const watcher = Actions.transaction.waitForReceipt(client, { hash })
  const received = await new Promise<{ transactionHash: `0x${string}` }>(
    (resolve) => watcher.onReceipt((receipt) => resolve(receipt)),
  )

  expect(received.transactionHash).toBe(hash)
})

test('onReceipt: fires immediately once the receipt has resolved', async () => {
  await setup()
  const hash = await Actions.transaction.send(client, {
    account: source.address,
    to,
    value: Value.fromEther('1'),
  })
  await testClient.block.mine({ blocks: 1 })

  const watcher = Actions.transaction.waitForReceipt(client, { hash })
  await watcher.receipt

  // Listener registered after resolution still fires (with the cached receipt),
  // and `onError` / `onReplaced` become no-ops.
  const late = await new Promise<`0x${string}`>((resolve) => {
    const off = watcher.onReceipt((receipt) => resolve(receipt.transactionHash))
    off()
  })
  expect(late).toBe(hash)

  let errored = false
  watcher.onError(() => {
    errored = true
  })()
  watcher.onReplaced(() => {})()
  expect(errored).toBe(false)
})

test('off: tears down and leaves the receipt pending', async () => {
  await setup()
  const hash = await Actions.transaction.send(client, {
    account: source.address,
    to,
    value: Value.fromEther('1'),
  })

  const watcher = Actions.transaction.waitForReceipt(client, { hash })
  let resolved = false
  watcher.receipt.then(() => {
    resolved = true
  })
  watcher.off()
  watcher.off() // idempotent

  // Registering after `off` is a no-op and never fires.
  let fired = false
  watcher.onReceipt(() => {
    fired = true
  })()
  watcher.onReplaced(() => {
    fired = true
  })()
  watcher.onError(() => {
    fired = true
  })()

  await testClient.block.mine({ blocks: 1 })
  await wait(300)

  expect(resolved).toBe(false)
  expect(fired).toBe(false)
})

test('waits for a receipt (send -> wait -> mine)', async () => {
  await setup()
  const hash = await Actions.transaction.send(client, {
    account: source.address,
    to,
    value: Value.fromEther('1'),
  })

  const [receipt] = await Promise.all([
    Actions.transaction.waitForReceipt(client, { hash }).receipt,
    (async () => {
      await wait(150)
      await mineSlowly(2)
    })(),
  ])

  expect(receipt.status).toBe('success')
})

test('waits for multiple confirmations', async () => {
  await setup()
  const hash = await Actions.transaction.send(client, {
    account: source.address,
    to,
    value: Value.fromEther('1'),
  })
  await testClient.block.mine({ blocks: 1 })

  const [receipt] = await Promise.all([
    Actions.transaction.waitForReceipt(client, { confirmations: 3, hash })
      .receipt,
    (async () => {
      await wait(150)
      await mineSlowly(3)
    })(),
  ])

  expect(receipt.status).toBe('success')
})

test('resolves identical receipts in parallel (observer dedupe)', async () => {
  await setup()
  const hash = await Actions.transaction.send(client, {
    account: source.address,
    to,
    value: Value.fromEther('1'),
  })
  await testClient.block.mine({ blocks: 1 })

  const [a, b, c] = await Promise.all([
    Actions.transaction.waitForReceipt(client, { hash }).receipt,
    Actions.transaction.waitForReceipt(client, { hash }).receipt,
    Actions.transaction.waitForReceipt(client, { hash }).receipt,
  ])

  expect(a).toEqual(b)
  expect(b).toEqual(c)
})

test('throws on timeout', async () => {
  await setup()
  await expect(
    Actions.transaction.waitForReceipt(client, {
      checkReplacement: false,
      hash: '0x0000000000000000000000000000000000000000000000000000000000000001',
      timeout: 500,
    }).receipt,
  ).rejects.toThrowError(WaitForReceiptTimeoutError)
})

test('onError: notifies a listener on timeout', async () => {
  await setup()
  const watcher = Actions.transaction.waitForReceipt(client, {
    checkReplacement: false,
    hash: '0x0000000000000000000000000000000000000000000000000000000000000002',
    timeout: 500,
  })

  const error = await new Promise<Error>((resolve) =>
    watcher.onError((error) => resolve(error)),
  )

  expect(error).toBeInstanceOf(WaitForReceiptTimeoutError)

  // Listener registered after the error still fires immediately.
  const late = await new Promise<Error>((resolve) => {
    const off = watcher.onError((error) => resolve(error))
    off()
  })
  expect(late).toBeInstanceOf(WaitForReceiptTimeoutError)
})

test('detects a repriced transaction', async () => {
  await setup()
  const nonce = await Actions.address.getTransactionCount(client, {
    address: source.address,
  })

  const hash = await Actions.transaction.send(client, {
    account: source.address,
    maxFeePerGas: Value.fromGwei('10'),
    maxPriorityFeePerGas: Value.fromGwei('1'),
    nonce,
    to,
    value: Value.fromEther('1'),
  })

  let replacement: Actions.transaction.waitForReceipt.ReplacementReturnType
  const watcher = Actions.transaction.waitForReceipt(client, { hash })
  watcher.onReplaced((response) => {
    replacement = response
  })
  const [receipt] = await Promise.all([
    watcher.receipt,
    (async () => {
      await whenPendingObserved(hash)
      await Actions.transaction.send(client, {
        account: source.address,
        maxFeePerGas: Value.fromGwei('20'),
        maxPriorityFeePerGas: Value.fromGwei('2'),
        nonce,
        to,
        value: Value.fromEther('1'),
      })
      await mineSlowly(2)
    })(),
  ])

  expect(receipt.status).toBe('success')
  expect(replacement!.reason).toBe('repriced')
  expect(replacement!.replacedTransaction.hash).toBe(hash)
  expect(replacement!.transaction.hash).not.toBe(hash)
})

test('detects a cancelled transaction', async () => {
  await setup()
  const nonce = await Actions.address.getTransactionCount(client, {
    address: source.address,
  })

  const hash = await Actions.transaction.send(client, {
    account: source.address,
    maxFeePerGas: Value.fromGwei('10'),
    maxPriorityFeePerGas: Value.fromGwei('1'),
    nonce,
    to,
    value: Value.fromEther('1'),
  })

  let replacement: Actions.transaction.waitForReceipt.ReplacementReturnType
  const watcher = Actions.transaction.waitForReceipt(client, { hash })
  watcher.onReplaced((response) => {
    replacement = response
  })
  await Promise.all([
    watcher.receipt,
    (async () => {
      await whenPendingObserved(hash)
      await Actions.transaction.send(client, {
        account: source.address,
        maxFeePerGas: Value.fromGwei('20'),
        maxPriorityFeePerGas: Value.fromGwei('2'),
        nonce,
        to: source.address,
        value: 0n,
      })
      await mineSlowly(2)
    })(),
  ])

  expect(replacement!.reason).toBe('cancelled')
})

test('detects a replaced transaction', async () => {
  await setup()
  const nonce = await Actions.address.getTransactionCount(client, {
    address: source.address,
  })

  const hash = await Actions.transaction.send(client, {
    account: source.address,
    maxFeePerGas: Value.fromGwei('10'),
    maxPriorityFeePerGas: Value.fromGwei('1'),
    nonce,
    to,
    value: Value.fromEther('1'),
  })

  let replacement: Actions.transaction.waitForReceipt.ReplacementReturnType
  const watcher = Actions.transaction.waitForReceipt(client, { hash })
  watcher.onReplaced((response) => {
    replacement = response
  })
  await Promise.all([
    watcher.receipt,
    (async () => {
      await whenPendingObserved(hash)
      await Actions.transaction.send(client, {
        account: source.address,
        maxFeePerGas: Value.fromGwei('20'),
        maxPriorityFeePerGas: Value.fromGwei('2'),
        nonce,
        to,
        value: Value.fromEther('2'),
      })
      await mineSlowly(2)
    })(),
  ])

  expect(replacement!.reason).toBe('replaced')
})

test('timeout: 0 disables the timeout timer', async () => {
  await setup()
  const watcher = Actions.transaction.waitForReceipt(client, {
    hash: '0x0000000000000000000000000000000000000000000000000000000000000003',
    timeout: 0,
  })
  // No timer is scheduled; the watcher polls until torn down.
  await wait(200)
  watcher.off()
})

test('listeners: unregister functions remove pending listeners', async () => {
  await setup()
  const watcher = Actions.transaction.waitForReceipt(client, {
    hash: '0x0000000000000000000000000000000000000000000000000000000000000004',
    timeout: 60_000,
  })

  let fired = false
  const offReceipt = watcher.onReceipt(() => {
    fired = true
  })
  const offReplaced = watcher.onReplaced(() => {
    fired = true
  })
  const offError = watcher.onError(() => {
    fired = true
  })
  offReceipt()
  offReplaced()
  offError()

  await wait(200)
  watcher.off()

  expect(fired).toBe(false)
})

test('rethrows a non-not-found error from the node', async () => {
  await setup()
  const hash = await Actions.transaction.send(client, {
    account: source.address,
    to,
    value: Value.fromEther('1'),
  })
  await testClient.block.mine({ blocks: 1 })

  const server = await proxyServer((method) =>
    method === 'eth_getTransactionReceipt'
      ? { error: { code: -32603, message: 'boom' } }
      : undefined,
  )
  try {
    const proxyClient = Client.create({
      transport: http(server.url),
      pollingInterval: 100,
    })

    await expect(
      Actions.transaction.waitForReceipt(proxyClient, {
        checkReplacement: false,
        hash,
      }).receipt,
    ).rejects.toThrowError()
  } finally {
    await server.close()
  }
})

test('retries fetching a transaction that the node surfaces slowly', async () => {
  await setup()
  const hash = await Actions.transaction.send(client, {
    account: source.address,
    to,
    value: Value.fromEther('1'),
  })
  await testClient.block.mine({ blocks: 1 })

  // The node reports the receipt + transaction as missing on the first lookup
  // (eager + first tick), then surfaces them: exercises the retry/backoff path.
  const server = await proxyServer((method, index) => {
    if (method === 'eth_getTransactionReceipt' && index === 0)
      return { result: null }
    if (method === 'eth_getTransactionByHash' && index === 0)
      return { result: null }
    return undefined
  })
  try {
    const proxyClient = Client.create({
      transport: http(server.url),
      pollingInterval: 100,
    })

    const receipt = await Actions.transaction.waitForReceipt(proxyClient, {
      hash,
    }).receipt

    expect(receipt.transactionHash).toBe(hash)
  } finally {
    await server.close()
  }
})

test('confirmations: waits across blocks when the receipt lands later', async () => {
  await setup()
  const hash = await Actions.transaction.send(client, {
    account: source.address,
    to,
    value: Value.fromEther('1'),
  })

  // Start waiting before the tx is mined (so the eager receipt lookup misses),
  // then mine: the tick that first sees the receipt has a single confirmation
  // (not yet enough), so it keeps polling until another block lands.
  const [receipt] = await Promise.all([
    Actions.transaction.waitForReceipt(client, { confirmations: 2, hash })
      .receipt,
    (async () => {
      await wait(200)
      await mineSlowly(2)
    })(),
  ])

  expect(receipt.status).toBe('success')
})

test('retrying: ignores ticks while a transaction lookup is in flight', async () => {
  await setup()
  const hash = await Actions.transaction.send(client, {
    account: source.address,
    to,
    value: Value.fromEther('1'),
  })
  await testClient.block.mine({ blocks: 1 })

  // The node reports the tx as missing for the first few lookups (with a slow
  // retry backoff). While a retry is in flight the head advances, so the poll
  // ticks that land during that window are skipped. Eventually the tx +
  // receipt surface and it resolves.
  const server = await proxyServer((method, index) => {
    if (method === 'eth_getTransactionReceipt' && index === 0)
      return { result: null }
    if (method === 'eth_getTransactionByHash' && index < 3)
      return { result: null }
    return undefined
  })
  try {
    const proxyClient = Client.create({
      transport: http(server.url),
      pollingInterval: 50,
    })

    const [receipt] = await Promise.all([
      Actions.transaction.waitForReceipt(proxyClient, {
        hash,
        retryCount: 6,
        retryDelay: () => 150,
      }).receipt,
      mineSlowly(4),
    ])

    expect(receipt.transactionHash).toBe(hash)
  } finally {
    await server.close()
  }
})

test('replacement: retries scanning a block the node has not synced yet', async () => {
  await setup()
  const nonce = await Actions.address.getTransactionCount(client, {
    address: source.address,
  })
  const hash = await Actions.transaction.send(client, {
    account: source.address,
    maxFeePerGas: Value.fromGwei('10'),
    maxPriorityFeePerGas: Value.fromGwei('1'),
    nonce,
    to,
    value: Value.fromEther('1'),
  })

  // The first block scan returns an unsynced (null) block, so the scan retries
  // with backoff before forwarding to the real block.
  const server = await proxyServer((method, index) =>
    method === 'eth_getBlockByNumber' && index === 0
      ? { result: null }
      : undefined,
  )
  try {
    const proxyClient = Client.create({
      transport: http(server.url),
      pollingInterval: 100,
    })

    let replacement: Actions.transaction.waitForReceipt.ReplacementReturnType
    const watcher = Actions.transaction.waitForReceipt(proxyClient, {
      hash,
      retryDelay: () => 50,
    })
    watcher.onReplaced((response) => {
      replacement = response
    })

    const [receipt] = await Promise.all([
      watcher.receipt,
      (async () => {
        await whenPendingObserved(hash)
        await Actions.transaction.send(client, {
          account: source.address,
          maxFeePerGas: Value.fromGwei('20'),
          maxPriorityFeePerGas: Value.fromGwei('2'),
          nonce,
          to,
          value: Value.fromEther('1'),
        })
        await mineSlowly(3)
      })(),
    ])

    expect(receipt.status).toBe('success')
    expect(replacement!.reason).toBe('repriced')
  } finally {
    await server.close()
  }
})

test('replacement: waits for confirmations after detecting a replacement', async () => {
  await setup()
  const nonce = await Actions.address.getTransactionCount(client, {
    address: source.address,
  })
  const hash = await Actions.transaction.send(client, {
    account: source.address,
    maxFeePerGas: Value.fromGwei('10'),
    maxPriorityFeePerGas: Value.fromGwei('1'),
    nonce,
    to,
    value: Value.fromEther('1'),
  })

  // The replacement is detected the moment it is mined (one confirmation),
  // which is not yet enough, so it keeps polling until another block lands and
  // then resolves with the replacement's receipt. (Like v2, `onReplaced` is not
  // emitted on this path: the cached receipt fast-path resolves it once the
  // confirmation count is met.)
  const watcher = Actions.transaction.waitForReceipt(client, {
    confirmations: 2,
    hash,
  })

  const [receipt] = await Promise.all([
    watcher.receipt,
    (async () => {
      await whenPendingObserved(hash)
      await Actions.transaction.send(client, {
        account: source.address,
        maxFeePerGas: Value.fromGwei('20'),
        maxPriorityFeePerGas: Value.fromGwei('2'),
        nonce,
        to,
        value: Value.fromEther('1'),
      })
      await mineSlowly(3)
    })(),
  ])

  expect(receipt.status).toBe('success')
  expect(receipt.transactionHash).not.toBe(hash)
})

test('replacement: surfaces a block-scan error to onError', async () => {
  await setup()
  const hash = await Actions.transaction.send(client, {
    account: source.address,
    to,
    value: Value.fromEther('1'),
  })

  // The original transaction is observed pending, but scanning the candidate
  // block fails with a non-retryable error, which surfaces to the receipt
  // promise (and `onError`).
  const server = await proxyServer((method) =>
    method === 'eth_getBlockByNumber'
      ? { error: { code: -32603, message: 'boom' } }
      : undefined,
  )
  try {
    await whenPendingObserved(hash)
    const proxyClient = Client.create({
      transport: http(server.url),
      pollingInterval: 100,
    })

    await expect(
      Actions.transaction.waitForReceipt(proxyClient, { hash }).receipt,
    ).rejects.toThrowError()
  } finally {
    await testClient.block.mine({ blocks: 1 })
    await server.close()
  }
})

test('resolves identical receipts across sequential waits', async () => {
  await setup()
  const hash = await Actions.transaction.send(client, {
    account: source.address,
    to,
    value: Value.fromEther('1'),
  })
  await testClient.block.mine({ blocks: 1 })

  const a = await Actions.transaction.waitForReceipt(client, { hash }).receipt
  const b = await Actions.transaction.waitForReceipt(client, { hash }).receipt
  const c = await Actions.transaction.waitForReceipt(client, { hash }).receipt

  expect(a).toEqual(b)
  expect(b).toEqual(c)
})

test('repriced: resolves when the replacement is mined across skipped blocks', async () => {
  await setup()
  const nonce = await Actions.address.getTransactionCount(client, {
    address: source.address,
  })
  const hash = await Actions.transaction.send(client, {
    account: source.address,
    maxFeePerGas: Value.fromGwei('10'),
    maxPriorityFeePerGas: Value.fromGwei('1'),
    nonce,
    to,
    value: Value.fromEther('1'),
  })

  let replacement: Actions.transaction.waitForReceipt.ReplacementReturnType
  const watcher = Actions.transaction.waitForReceipt(client, { hash })
  watcher.onReplaced((response) => {
    replacement = response
  })

  const [receipt] = await Promise.all([
    watcher.receipt,
    (async () => {
      await whenPendingObserved(hash)
      await Actions.transaction.send(client, {
        account: source.address,
        maxFeePerGas: Value.fromGwei('20'),
        maxPriorityFeePerGas: Value.fromGwei('2'),
        nonce,
        to,
        value: Value.fromEther('1'),
      })
      // Mine several blocks at once: the watcher only sees the head jump, so it
      // must backfill the skipped block numbers to find the replacement.
      await testClient.block.mine({ blocks: 5 })
    })(),
  ])

  expect(receipt.status).toBe('success')
  expect(replacement!.reason).toBe('repriced')
})

test('checkReplacement: false ignores replacements and times out', async () => {
  await setup()
  const nonce = await Actions.address.getTransactionCount(client, {
    address: source.address,
  })
  const hash = await Actions.transaction.send(client, {
    account: source.address,
    maxFeePerGas: Value.fromGwei('10'),
    maxPriorityFeePerGas: Value.fromGwei('1'),
    nonce,
    to,
    value: Value.fromEther('1'),
  })

  let replaced = false
  const watcher = Actions.transaction.waitForReceipt(client, {
    checkReplacement: false,
    hash,
    timeout: 3_000,
  })
  watcher.onReplaced(() => {
    replaced = true
  })

  // Replace the original transaction: with `checkReplacement: false` the
  // watcher keeps waiting on the original hash and times out instead of
  // resolving with the replacement's receipt.
  await whenPendingObserved(hash)
  await Actions.transaction.send(client, {
    account: source.address,
    maxFeePerGas: Value.fromGwei('20'),
    maxPriorityFeePerGas: Value.fromGwei('2'),
    nonce,
    to,
    value: Value.fromEther('2'),
  })
  await testClient.block.mine({ blocks: 1 })

  await expect(watcher.receipt).rejects.toThrowError(WaitForReceiptTimeoutError)
  expect(replaced).toBe(false)
})
