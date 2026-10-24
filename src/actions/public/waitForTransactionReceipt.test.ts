import { Instance, Pool } from 'prool'
import {
  createPublicClient,
  createTestClient,
  custom,
  getAddress,
  http,
  InvalidInputRpcError,
  type ReplacementReturnType,
} from 'viem'
import { getTransactionReceipt } from 'viem/actions'
import { describe, expect, onTestFinished, test, vi } from 'vitest'
import { anvilMainnet } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { createHttpServer } from '~test/utils.js'
import { mainnet } from '../../chains/index.js'
import { WaitForTransactionReceiptTimeoutError } from '../../errors/transaction.js'
import type { Chain } from '../../types/chain.js'
import { hexToNumber } from '../../utils/encoding/fromHex.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { parseGwei } from '../../utils/unit/parseGwei.js'
import { wait } from '../../utils/wait.js'
import { setIntervalMining } from '../index.js'
import { mine } from '../test/mine.js'
import { sendTransaction } from '../wallet/sendTransaction.js'
import * as getBlock from './getBlock.js'
import { waitForTransactionReceipt } from './waitForTransactionReceipt.js'

const client = anvilMainnet.getClient()

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

async function setup() {
  await setIntervalMining(client, { interval: 2 })
}

test('waits for transaction (send -> wait -> mine)', async () => {
  setup()

  const hash = await sendTransaction(client, {
    account: sourceAccount.address,
    to: targetAccount.address,
    value: parseEther('1'),
  })
  const { status } = await waitForTransactionReceipt(client, {
    hash,
  })
  expect(status).toBe('success')
})

test('waits for transaction (send -> mine -> wait)', async () => {
  setup()

  const hash = await sendTransaction(client, {
    account: sourceAccount.address,
    to: targetAccount.address,
    value: parseEther('1'),
  })
  await mine(client, { blocks: 1 })
  const { status } = await waitForTransactionReceipt(client, {
    hash,
  })
  expect(status).toBe('success')
})

test.each([2, 3])(
  'waits for a mined transaction after %i unavailable receipts without reporting a replacement',
  async (missingReceipts) => {
    const pool = Pool.define({
      instance: Instance.anvil({ chainId: mainnet.id, noMining: true }),
    })
    onTestFinished(() => pool.destroyAll())
    const node = await pool.start(1)
    const laggingNode = await pool.start(2)
    const minedClient = createTestClient({
      chain: mainnet,
      mode: 'anvil',
      transport: http(node.url),
    })
    const laggingClient = createPublicClient({
      transport: http(laggingNode.url),
    })
    const hash = await sendTransaction(minedClient, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
    })
    await mine(minedClient, { blocks: 1 })
    const receipt = await getTransactionReceipt(minedClient, { hash })
    await setIntervalMining(minedClient, { interval: 1 })

    // Route receipt reads to a lagging node while transaction and block reads are current.
    const client = createPublicClient({
      chain: mainnet,
      pollingInterval: 50,
      transport: custom({
        request(options) {
          if (
            options.method === 'eth_getTransactionReceipt' &&
            missingReceipts-- > 0
          )
            return laggingClient.request(options)
          return minedClient.request(options)
        },
      }),
    })
    const replacements: ReplacementReturnType[] = []

    const result = await client.waitForTransactionReceipt({
      hash,
      onReplaced: (replacement) => replacements.push(replacement),
      timeout: 10_000,
    })

    expect(result).toEqual(receipt)
    expect(replacements).toMatchInlineSnapshot('[]')
  },
)

test('waits for transaction (multiple waterfall)', async () => {
  setup()

  const hash = await sendTransaction(client, {
    account: sourceAccount.address,
    to: targetAccount.address,
    value: parseEther('1'),
  })
  const receipt_1 = await waitForTransactionReceipt(client, {
    hash,
  })
  const receipt_2 = await waitForTransactionReceipt(client, {
    hash,
  })
  const receipt_3 = await waitForTransactionReceipt(client, {
    hash,
  })
  const receipt_4 = await waitForTransactionReceipt(client, {
    hash,
  })
  expect(receipt_1).toEqual(receipt_2)
  expect(receipt_2).toEqual(receipt_3)
  expect(receipt_3).toEqual(receipt_4)
})

test('waits for transaction (multiple parallel)', async () => {
  setup()

  const hash = await sendTransaction(client, {
    account: sourceAccount.address,
    to: targetAccount.address,
    value: parseEther('1'),
  })
  const [receipt_1, receipt_2, receipt_3, receipt_4] = await Promise.all([
    waitForTransactionReceipt(client, {
      hash,
    }),
    waitForTransactionReceipt(client, {
      hash,
    }),
    waitForTransactionReceipt(client, {
      hash,
    }),
    waitForTransactionReceipt(client, {
      hash,
    }),
  ])
  expect(receipt_1).toEqual(receipt_2)
  expect(receipt_2).toEqual(receipt_3)
  expect(receipt_3).toEqual(receipt_4)
})

test('waits for transaction (polling many blocks while others waiting does not trigger race condition)', async () => {
  const pool = Pool.define({
    instance: Instance.anvil({ chainId: mainnet.id, noMining: true }),
  })
  onTestFinished(() => pool.destroyAll())
  const node = await pool.start(1)
  const pending = new Set<string>()
  const client = createTestClient({
    chain: mainnet,
    mode: 'anvil',
    pollingInterval: 50,
    transport: http(node.url, {
      batch: true,
      async onFetchResponse(response) {
        const responses = await response.clone().json()
        for (const { result } of responses)
          if (result?.blockHash === null && result.hash)
            pending.add(result.hash)
      },
    }),
  })
  const hash = await sendTransaction(client, {
    account: sourceAccount.address,
    to: targetAccount.address,
    value: parseEther('1'),
  })
  const confirmedHash = await sendTransaction(client, {
    account: targetAccount.address,
    to: sourceAccount.address,
    value: parseEther('0.0001'),
  })

  const confirmedReceipt = waitForTransactionReceipt(client, {
    confirmations: 102,
    hash: confirmedHash,
    timeout: 10_000,
    retryCount: 0,
  })
  const receipt = waitForTransactionReceipt(client, {
    hash,
    timeout: 10_000,
    retryCount: 0,
  })
  const receipts = Promise.allSettled([receipt, confirmedReceipt])
  onTestFinished(async () => {
    await receipts
  })

  // Observe both pending transactions before emitting missed blocks to the shared poller.
  await expect
    .poll(() => [...pending].sort())
    .toEqual([hash, confirmedHash].sort())
  await mine(client, { blocks: 100 })
  expect(await receipt).toEqual(await getTransactionReceipt(client, { hash }))

  await mine(client, { blocks: 2 })

  expect(await confirmedReceipt).toEqual(
    await getTransactionReceipt(client, { hash: confirmedHash }),
  )
  expect((await confirmedReceipt).blockNumber).toMatchInlineSnapshot('1n')
})

describe('replaced transactions', () => {
  test('repriced', async () => {
    setup()

    await mine(client, { blocks: 10 })

    const nonce = hexToNumber(
      (await client.request({
        method: 'eth_getTransactionCount',
        params: [sourceAccount.address, 'latest'],
      })) ?? '0x0',
    )

    const hash = await sendTransaction(client, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
      maxFeePerGas: parseGwei('10'),
      nonce,
    })

    let replacement: any
    const [receipt] = await Promise.all([
      waitForTransactionReceipt(client, {
        hash,
        onReplaced: (replacement_) => (replacement = replacement_),
      }),
      (async () => {
        await wait(500)

        // speed up
        await sendTransaction(client, {
          account: sourceAccount.address,
          to: targetAccount.address,
          value: parseEther('1'),
          nonce,
          maxFeePerGas: parseGwei('20'),
        })
      })(),
    ])

    expect(receipt !== null).toBeTruthy()
    expect(replacement.reason).toBe('repriced')
    expect(replacement.replacedTransaction).toBeDefined()
    expect(replacement.transaction).toBeDefined()
    expect(replacement.transactionReceipt).toBeDefined()
  })

  test('repriced (skipped blocks)', async () => {
    setup()

    await mine(client, { blocks: 10 })

    const nonce = hexToNumber(
      (await client.request({
        method: 'eth_getTransactionCount',
        params: [sourceAccount.address, 'latest'],
      })) ?? '0x0',
    )

    const hash = await sendTransaction(client, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
      maxFeePerGas: parseGwei('10'),
      nonce,
    })

    const [receipt] = await Promise.all([
      waitForTransactionReceipt(client, {
        hash,
      }),
      (async () => {
        await wait(500)

        // speed up
        await sendTransaction(client, {
          account: sourceAccount.address,
          to: targetAccount.address,
          value: parseEther('1'),
          nonce,
          maxFeePerGas: parseGwei('20'),
        })

        await wait(1000)
        await mine(client, { blocks: 5 })
      })(),
    ])

    expect(receipt !== null).toBeTruthy()
  })

  test('repriced (same input)', async () => {
    setup()

    await mine(client, { blocks: 10 })

    const nonce = hexToNumber(
      (await client.request({
        method: 'eth_getTransactionCount',
        params: [sourceAccount.address, 'latest'],
      })) ?? '0x0',
    )

    const hash = await sendTransaction(client, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
      data: '0x',
      maxFeePerGas: parseGwei('10'),
      nonce,
    })

    let replacement: any
    const [receipt] = await Promise.all([
      waitForTransactionReceipt(client, {
        hash,
        onReplaced: (replacement_) => (replacement = replacement_),
      }),
      (async () => {
        await wait(500)

        // speed up
        await sendTransaction(client, {
          account: sourceAccount.address,
          to: targetAccount.address,
          value: parseEther('1'),
          data: '0x',
          nonce,
          maxFeePerGas: parseGwei('20'),
        })
      })(),
    ])

    expect(receipt !== null).toBeTruthy()
    expect(replacement.reason).toBe('repriced')
    expect(replacement.replacedTransaction).toBeDefined()
    expect(replacement.transaction).toBeDefined()
    expect(replacement.transactionReceipt).toBeDefined()
  })

  test('repriced (rpc returns differently-cased addresses)', async () => {
    setup()

    await mine(client, { blocks: 10 })

    const nonce = hexToNumber(
      (await client.request({
        method: 'eth_getTransactionCount',
        params: [sourceAccount.address, 'latest'],
      })) ?? '0x0',
    )

    const hash = await sendTransaction(client, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
      maxFeePerGas: parseGwei('10'),
      nonce,
    })

    // Checksum pending transaction addresses; anvil returns mined ones lowercase.
    const checksummingClient = createPublicClient({
      chain: mainnet,
      pollingInterval: 50,
      transport: custom({
        async request(options) {
          if (options.method !== 'eth_getTransactionByHash')
            return client.request(options)
          const transaction = await client.request({
            method: 'eth_getTransactionByHash',
            params: options.params,
          })
          if (transaction?.blockNumber !== null) return transaction
          return {
            ...transaction,
            from: getAddress(transaction.from),
            to: getAddress(transaction.to!),
          }
        },
      }),
    })
    const replacements: ReplacementReturnType[] = []

    const [receipt, replacementHash] = await Promise.all([
      waitForTransactionReceipt(checksummingClient, {
        hash,
        onReplaced: (replacement) => replacements.push(replacement),
        timeout: 10_000,
      }),
      (async () => {
        await wait(500)

        // speed up
        return sendTransaction(client, {
          account: sourceAccount.address,
          to: targetAccount.address,
          value: parseEther('1'),
          nonce,
          maxFeePerGas: parseGwei('20'),
        })
      })(),
    ])

    expect(receipt.transactionHash).toBe(replacementHash)
    expect(replacements.map(({ reason }) => reason)).toMatchInlineSnapshot(`
      [
        "repriced",
      ]
    `)
  })

  test('replaced (different input)', async () => {
    setup()

    await mine(client, { blocks: 10 })

    const nonce = hexToNumber(
      (await client.request({
        method: 'eth_getTransactionCount',
        params: [sourceAccount.address, 'latest'],
      })) ?? '0x0',
    )

    const hash = await sendTransaction(client, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
      data: '0x',
      maxFeePerGas: parseGwei('10'),
      nonce,
    })

    let replacement: any
    const [receipt] = await Promise.all([
      waitForTransactionReceipt(client, {
        hash,
        onReplaced: (replacement_) => (replacement = replacement_),
      }),
      (async () => {
        await wait(500)

        // speed up
        await sendTransaction(client, {
          account: sourceAccount.address,
          to: targetAccount.address,
          value: parseEther('1'),
          data: '0xdeadbeef',
          nonce,
          maxFeePerGas: parseGwei('20'),
        })
      })(),
    ])

    expect(receipt !== null).toBeTruthy()
    expect(replacement.reason).toBe('replaced')
    expect(replacement.replacedTransaction).toBeDefined()
    expect(replacement.transaction).toBeDefined()
    expect(replacement.transactionReceipt).toBeDefined()
  })

  test('cancelled', async () => {
    setup()

    await mine(client, { blocks: 10 })

    const nonce = hexToNumber(
      (await client.request({
        method: 'eth_getTransactionCount',
        params: [sourceAccount.address, 'latest'],
      })) ?? '0x0',
    )

    const hash = await sendTransaction(client, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
      maxFeePerGas: parseGwei('10'),
      nonce,
    })

    let replacement: any
    const [receipt] = await Promise.all([
      waitForTransactionReceipt(client, {
        hash,
        onReplaced: (replacement_) => (replacement = replacement_),
      }),
      (async () => {
        await wait(500)

        // speed up
        await sendTransaction(client, {
          account: sourceAccount.address,
          to: sourceAccount.address,
          value: parseEther('0'),
          nonce,
          maxFeePerGas: parseGwei('20'),
        })
      })(),
    ])

    expect(receipt !== null).toBeTruthy()
    expect(replacement.reason).toBe('cancelled')
    expect(replacement.replacedTransaction).toBeDefined()
    expect(replacement.transaction).toBeDefined()
    expect(replacement.transactionReceipt).toBeDefined()
  })

  test('replaced', async () => {
    setup()

    await mine(client, { blocks: 10 })

    const nonce = hexToNumber(
      (await client.request({
        method: 'eth_getTransactionCount',
        params: [sourceAccount.address, 'latest'],
      })) ?? '0x0',
    )

    const hash = await sendTransaction(client, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
      maxFeePerGas: parseGwei('10'),
      nonce,
    })

    let replacement: any
    const [receipt] = await Promise.all([
      waitForTransactionReceipt(client, {
        hash,
        onReplaced: (replacement_) => (replacement = replacement_),
      }),
      (async () => {
        await wait(500)

        // speed up
        await sendTransaction(client, {
          account: sourceAccount.address,
          to: targetAccount.address,
          value: parseEther('2'),
          nonce,
          maxFeePerGas: parseGwei('20'),
        })
      })(),
    ])

    expect(receipt !== null).toBeTruthy()
    expect(replacement.reason).toBe('replaced')
    expect(replacement.replacedTransaction).toBeDefined()
    expect(replacement.transaction).toBeDefined()
    expect(replacement.transactionReceipt).toBeDefined()
  })

  test('chain: supportsTransactionReplacementDetection: false', async () => {
    setup()

    const client = {
      ...anvilMainnet.getClient(),
      chain: {
        ...anvilMainnet.chain,
        supportsTransactionReplacementDetection: false,
      },
    }

    await mine(client, { blocks: 10 })

    const nonce = hexToNumber(
      (await client.request({
        method: 'eth_getTransactionCount',
        params: [sourceAccount.address, 'latest'],
      })) ?? '0x0',
    )

    const hash = await sendTransaction(client, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
      maxFeePerGas: parseGwei('10'),
      nonce,
    })

    let replacementCalled = false
    const receiptPromise = waitForTransactionReceipt(client, {
      hash,
      timeout: 3000,
      onReplaced: () => (replacementCalled = true),
    })

    // Replace the transaction with a higher gas price
    await wait(500)
    await sendTransaction(client, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('2'),
      nonce,
      maxFeePerGas: parseGwei('20'),
    })

    // Since checkReplacement is false, it should timeout waiting for the original transaction
    // rather than detecting the replacement
    await expect(receiptPromise).rejects.toThrowError(
      WaitForTransactionReceiptTimeoutError,
    )

    // The onReplaced callback should not have been called
    expect(replacementCalled).toBe(false)
  })
})

describe('args: confirmations', () => {
  test('waits for confirmations', async () => {
    setup()

    const hash = await sendTransaction(client, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
      maxFeePerGas: parseGwei('10'),
    })

    const start = Date.now()
    const receipt = await waitForTransactionReceipt(client, {
      hash,
      confirmations: 3,
    })
    const end = Date.now()

    expect(receipt !== null).toBeTruthy()
    expect(end - start).toBeGreaterThan(6000 - 500)
    expect(end - start).toBeLessThanOrEqual(6000 + 500)
  })

  test('waits for confirmations (replaced)', async () => {
    setup()

    await mine(client, { blocks: 10 })

    const nonce = hexToNumber(
      (await client.request({
        method: 'eth_getTransactionCount',
        params: [sourceAccount.address, 'latest'],
      })) ?? '0x0',
    )

    const hash = await sendTransaction(client, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
      maxFeePerGas: parseGwei('10'),
      nonce,
    })

    const [receipt] = await Promise.all([
      waitForTransactionReceipt(client, {
        confirmations: 3,
        hash,
      }),
      (async () => {
        await wait(500)

        // speed up
        await sendTransaction(client, {
          account: sourceAccount.address,
          to: targetAccount.address,
          value: parseEther('1'),
          nonce,
          maxFeePerGas: parseGwei('20'),
        })

        await wait(1000)
      })(),
    ])

    expect(receipt !== null).toBeTruthy()
  })
})

describe('args: replacement', () => {
  const transaction = {
    from: sourceAccount.address,
    input: '0x',
    nonce: 0,
    to: targetAccount.address,
    value: parseEther('1'),
  } as const

  test('detects a replacement mined before the wait starts', async () => {
    const { cancelHash, hash, testClient } = await replaceTransaction({
      blocks: 2,
    })
    const replacements: ReplacementReturnType[] = []

    const receipt = await waitForTransactionReceipt(testClient, {
      hash,
      onReplaced: (replacement) => replacements.push(replacement),
      pollingInterval: 100,
      replacement: transaction,
      timeout: 5_000,
    })

    expect(receipt.transactionHash).toBe(cancelHash)
    expect(replacements).toHaveLength(1)
    expect(replacements[0]!.reason).toBe('cancelled')
    expect(replacements[0]!.replacedTransaction).toEqual({
      ...transaction,
      hash,
    })
    expect(replacements[0]!.transaction.hash).toBe(cancelHash)
    expect(replacements[0]!.transactionReceipt).toEqual(receipt)
  })

  test('looks up the transaction again after a failed lookup', async () => {
    const { cancelHash, hash, rpcUrl, testClient } = await replaceTransaction({
      blocks: 2,
    })
    await setIntervalMining(testClient, { interval: 1 })

    // The first lookup fails, as on a node behind the latest block.
    let failures = 1
    const proxyUrl = await createRpcProxy(rpcUrl, ({ method }) => {
      if (method === 'eth_getTransactionBySenderAndNonce' && failures-- > 0)
        return { code: -32000, message: 'header not found' }
      return undefined
    })
    const client = createPublicClient({
      chain: mainnet,
      pollingInterval: 100,
      transport: http(proxyUrl),
    })
    const replacements: ReplacementReturnType[] = []

    const receipt = await waitForTransactionReceipt(client, {
      hash,
      onReplaced: (replacement) => replacements.push(replacement),
      replacement: transaction,
      timeout: 10_000,
    })

    expect(receipt.transactionHash).toBe(cancelHash)
    expect(replacements.map(({ reason }) => reason)).toMatchInlineSnapshot(`
      [
        "cancelled",
      ]
    `)
  })

  test.each([-32601, -32004])(
    'scans blocks when the lookup fails with code %i',
    async (code) => {
      const { cancelHash, hash, rpcUrl } = await replaceTransaction({
        blocks: 1,
      })
      const proxyUrl = await createRpcProxy(rpcUrl, ({ method }) => {
        if (method === 'eth_getTransactionBySenderAndNonce')
          return { code, message: 'method not supported' }
        return undefined
      })
      const client = createPublicClient({
        chain: mainnet,
        pollingInterval: 100,
        transport: http(proxyUrl),
      })
      const replacements: ReplacementReturnType[] = []

      const receipt = await waitForTransactionReceipt(client, {
        hash,
        onReplaced: (replacement) => replacements.push(replacement),
        replacement: transaction,
        timeout: 5_000,
      })

      expect(receipt.transactionHash).toBe(cancelHash)
      expect(replacements.map(({ reason }) => reason)).toMatchInlineSnapshot(`
        [
          "cancelled",
        ]
      `)
    },
  )

  test('waits for the receipt of a replacement', async () => {
    const { cancelHash, hash, pool, testClient } = await replaceTransaction({
      blocks: 1,
    })
    const laggingNode = await pool.start(2)
    const laggingClient = createPublicClient({
      transport: http(laggingNode.url),
    })
    await setIntervalMining(testClient, { interval: 1 })

    // Route the first receipt read of the replacement to a lagging node.
    let missingReceipts = 1
    const client = createPublicClient({
      chain: mainnet,
      pollingInterval: 100,
      transport: custom({
        request(options) {
          if (
            options.method === 'eth_getTransactionReceipt' &&
            (options.params as readonly unknown[])[0] === cancelHash &&
            missingReceipts-- > 0
          )
            return laggingClient.request(options)
          return testClient.request(options)
        },
      }),
    })
    const replacements: ReplacementReturnType[] = []

    const receipt = await waitForTransactionReceipt(client, {
      hash,
      onReplaced: (replacement) => replacements.push(replacement),
      replacement: transaction,
      timeout: 10_000,
    })

    expect(receipt.transactionHash).toBe(cancelHash)
    expect(replacements.map(({ reason }) => reason)).toMatchInlineSnapshot(`
      [
        "cancelled",
      ]
    `)
  })

  test('rejects when the receipt of a replacement fails', async () => {
    const { cancelHash, hash, rpcUrl } = await replaceTransaction({
      blocks: 2,
    })
    const proxyUrl = await createRpcProxy(rpcUrl, ({ method, params }) => {
      if (method === 'eth_getTransactionReceipt' && params[0] === cancelHash)
        return { code: -32000, message: 'receipt unavailable' }
      return undefined
    })
    const client = createPublicClient({
      chain: mainnet,
      pollingInterval: 100,
      transport: http(proxyUrl),
    })

    await expect(
      waitForTransactionReceipt(client, {
        hash,
        replacement: transaction,
        timeout: 5_000,
      }),
    ).rejects.toThrowError(InvalidInputRpcError)
  })

  test('waits for the transaction when it holds its nonce slot', async () => {
    const pool = Pool.define({
      instance: Instance.anvil({ chainId: mainnet.id, noMining: true }),
    })
    onTestFinished(() => pool.destroyAll())
    const node = await pool.start(1)
    const laggingNode = await pool.start(2)
    const testClient = createTestClient({
      chain: mainnet,
      mode: 'anvil',
      transport: http(node.url),
    })
    const laggingClient = createPublicClient({
      transport: http(laggingNode.url),
    })
    const hash = await sendTransaction(testClient, {
      account: sourceAccount.address,
      nonce: 0,
      to: targetAccount.address,
      value: parseEther('1'),
    })
    await mine(testClient, { blocks: 1 })
    const receipt = await getTransactionReceipt(testClient, { hash })
    await setIntervalMining(testClient, { interval: 1 })

    // Route transaction reads, and the first receipt read, to a lagging node.
    let missingReceipts = 1
    const client = createPublicClient({
      chain: mainnet,
      pollingInterval: 100,
      transport: custom({
        request(options) {
          if (
            options.method === 'eth_getTransactionByHash' ||
            (options.method === 'eth_getTransactionReceipt' &&
              missingReceipts-- > 0)
          )
            return laggingClient.request(options)
          return testClient.request(options)
        },
      }),
    })
    const replacements: ReplacementReturnType[] = []

    const result = await waitForTransactionReceipt(client, {
      hash,
      onReplaced: (replacement) => replacements.push(replacement),
      replacement: transaction,
      timeout: 10_000,
    })

    expect(result).toEqual(receipt)
    expect(replacements).toMatchInlineSnapshot('[]')
  })

  test('waits for confirmations of a replacement', async () => {
    const { cancelHash, hash, testClient } = await replaceTransaction({
      blocks: 1,
    })
    await setIntervalMining(testClient, { interval: 1 })
    const replacements: ReplacementReturnType[] = []

    const receipt = await waitForTransactionReceipt(testClient, {
      confirmations: 2,
      hash,
      onReplaced: (replacement) => replacements.push(replacement),
      pollingInterval: 100,
      replacement: transaction,
      timeout: 10_000,
    })

    expect(receipt.transactionHash).toBe(cancelHash)
    expect(replacements.map(({ reason }) => reason)).toMatchInlineSnapshot(`
      [
        "cancelled",
      ]
    `)
  })

  test('uses the chain replacement reason', async () => {
    const { cancelHash, hash, rpcUrl } = await replaceTransaction({
      blocks: 2,
    })
    const client = createPublicClient({
      chain: {
        ...mainnet,
        transactionReplacement: { getReason: () => 'repriced' },
      } satisfies Chain,
      pollingInterval: 100,
      transport: http(rpcUrl),
    })
    const replacements: ReplacementReturnType[] = []

    const receipt = await waitForTransactionReceipt(client, {
      hash,
      onReplaced: (replacement) => replacements.push(replacement),
      replacement: transaction,
      timeout: 5_000,
    })

    expect(receipt.transactionHash).toBe(cancelHash)
    expect(replacements.map(({ reason }) => reason)).toMatchInlineSnapshot(`
      [
        "repriced",
      ]
    `)
  })

  test('ignores it on chains with their own replacement keys', async () => {
    const { hash, rpcUrl } = await replaceTransaction({ blocks: 1 })
    const client = createPublicClient({
      chain: {
        ...mainnet,
        transactionReplacement: {
          getKey: (transaction) => `0:${transaction.nonce}`,
        },
      } satisfies Chain,
      pollingInterval: 100,
      transport: http(rpcUrl),
    })
    const replacements: ReplacementReturnType[] = []

    await expect(
      waitForTransactionReceipt(client, {
        hash,
        onReplaced: (replacement) => replacements.push(replacement),
        replacement: transaction,
        timeout: 2_000,
      }),
    ).rejects.toThrowError(WaitForTransactionReceiptTimeoutError)
    expect(replacements).toMatchInlineSnapshot('[]')
  })

  test('rejects when onReplaced throws', async () => {
    const { hash, testClient } = await replaceTransaction({ blocks: 2 })

    await expect(
      waitForTransactionReceipt(testClient, {
        hash,
        onReplaced: () => {
          throw new Error('onReplaced failed')
        },
        pollingInterval: 100,
        replacement: transaction,
        timeout: 5_000,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot('[Error: onReplaced failed]')
  })

  test('ignores it when checkReplacement is false', async () => {
    const { hash, testClient } = await replaceTransaction({ blocks: 2 })

    await expect(
      waitForTransactionReceipt(testClient, {
        checkReplacement: false,
        hash,
        pollingInterval: 100,
        replacement: transaction,
        timeout: 1_000,
      }),
    ).rejects.toThrowError(WaitForTransactionReceiptTimeoutError)
  })
})

test('args: timeout', async () => {
  setup()

  const hash = await sendTransaction(client, {
    account: sourceAccount.address,
    to: targetAccount.address,
    value: parseEther('1'),
  })
  await expect(() =>
    waitForTransactionReceipt(client, {
      hash,
      timeout: 500,
    }),
  ).rejects.toThrowError(WaitForTransactionReceiptTimeoutError)
})

describe('errors', () => {
  test('throws when transaction replaced and getBlock fails', async () => {
    setup()

    vi.spyOn(getBlock, 'getBlock').mockRejectedValue(new Error('foo'))

    await mine(client, { blocks: 10 })

    const nonce = hexToNumber(
      (await client.request({
        method: 'eth_getTransactionCount',
        params: [sourceAccount.address, 'latest'],
      })) ?? '0x0',
    )

    const hash = await sendTransaction(client, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
      maxFeePerGas: parseGwei('10'),
      nonce,
    })

    await expect(() =>
      Promise.all([
        waitForTransactionReceipt(client, {
          hash,
        }),
        (async () => {
          await wait(500)

          // speed up
          await sendTransaction(client, {
            account: sourceAccount.address,
            to: targetAccount.address,
            value: parseEther('2'),
            nonce,
            maxFeePerGas: parseGwei('20'),
          })
        })(),
      ]),
    ).rejects.toThrowErrorMatchingInlineSnapshot('[Error: foo]')
  })
})

describe('concurrent waits with different options', () => {
  const hash = `0x${'ab'.repeat(32)}` as `0x${string}`
  const receipt = {
    transactionHash: hash,
    transactionIndex: '0x0',
    blockHash: `0x${'cd'.repeat(32)}`,
    blockNumber: '0x64',
    from: `0x${'11'.repeat(20)}`,
    to: `0x${'22'.repeat(20)}`,
    cumulativeGasUsed: '0x5208',
    gasUsed: '0x5208',
    effectiveGasPrice: '0x1',
    contractAddress: null,
    logs: [],
    logsBloom: `0x${'00'.repeat(256)}`,
    status: '0x1',
    type: '0x2',
  }

  test('a timing out call does not starve a longer-timeout call', async () => {
    // The transaction is mined 300ms after start; one block per poll.
    const start = Date.now()
    let block = 100n
    const client_ = createPublicClient({
      chain: mainnet,
      transport: custom({
        async request({ method }) {
          if (method === 'eth_blockNumber') return `0x${(block++).toString(16)}`
          if (method === 'eth_getTransactionReceipt')
            return Date.now() - start > 300 ? receipt : null
          throw new Error(`unexpected ${method}`)
        },
      }),
      pollingInterval: 20,
    })

    const short = client_.waitForTransactionReceipt({
      hash,
      timeout: 100,
      checkReplacement: false,
    })
    const long = client_.waitForTransactionReceipt({
      hash,
      timeout: 2_000,
      checkReplacement: false,
    })

    await expect(short).rejects.toThrowError(
      WaitForTransactionReceiptTimeoutError,
    )
    expect((await long).transactionHash).toBe(hash)
  })

  test('a call honors its own confirmations', async () => {
    // The receipt (block 100) is available immediately; one block per poll.
    let block = 100n
    const client_ = createPublicClient({
      chain: mainnet,
      transport: custom({
        async request({ method }) {
          if (method === 'eth_blockNumber') return `0x${(block++).toString(16)}`
          if (method === 'eth_getTransactionReceipt') return receipt
          throw new Error(`unexpected ${method}`)
        },
      }),
      pollingInterval: 20,
    })

    const first = client_.waitForTransactionReceipt({
      hash,
      checkReplacement: false,
    })
    const second = client_.waitForTransactionReceipt({
      hash,
      confirmations: 5,
      checkReplacement: false,
    })

    // Resolves at the default 1 confirmation.
    await first
    // 5 confirmations require head >= 104: must keep polling past the
    // first call's resolution instead of inheriting its confirmations.
    await second
    expect(block).toBeGreaterThanOrEqual(105n)
  })
})

describe('concurrent waits with identical options', () => {
  const hash = `0x${'ef'.repeat(32)}` as `0x${string}`
  const receipt = {
    transactionHash: hash,
    transactionIndex: '0x0',
    blockHash: `0x${'cd'.repeat(32)}`,
    blockNumber: '0x64',
    from: `0x${'11'.repeat(20)}`,
    to: `0x${'22'.repeat(20)}`,
    cumulativeGasUsed: '0x5208',
    gasUsed: '0x5208',
    effectiveGasPrice: '0x1',
    contractAddress: null,
    logs: [],
    logsBloom: `0x${'00'.repeat(256)}`,
    status: '0x1',
    type: '0x2',
  }

  // A wait that joins an observer nothing polls for never settles on its own,
  // so bound it and fail on the reason instead of hanging the suite.
  async function expectHash(promise: Promise<{ transactionHash: string }>) {
    const settled = await Promise.race([
      promise.then(({ transactionHash }) => transactionHash),
      wait(1_000).then(() => 'stalled' as const),
    ])
    expect(settled).toBe(hash)
  }

  test('a settled caller does not leave a stale listener behind', async () => {
    // The transaction is already mined, so the first caller resolves from its
    // setup call and never starts polling.
    const client_ = createPublicClient({
      chain: mainnet,
      transport: custom({
        async request({ method }) {
          if (method === 'eth_getTransactionReceipt') return receipt
          throw new Error(`unexpected ${method}`)
        },
      }),
      pollingInterval: 20,
    })

    const [first, second] = await Promise.all([
      client_.waitForTransactionReceipt({
        hash,
        timeout: 0,
        checkReplacement: false,
      }),
      client_.waitForTransactionReceipt({
        hash,
        timeout: 0,
        checkReplacement: false,
      }),
    ])
    expect(first.transactionHash).toBe(hash)
    expect(second.transactionHash).toBe(hash)

    // Both callers are settled, so the observer they shared must be gone. If
    // the second caller's listener is still cached, this wait joins it, skips
    // its own setup and never settles.
    await expectHash(
      client_.waitForTransactionReceipt({
        hash,
        timeout: 0,
        checkReplacement: false,
      }),
    )
  })

  test('a caller that resolves during polling unobserves without a timeout', async () => {
    // Mined on the third poll: both callers are attached to the same observer
    // before the receipt exists, and `timeout: 0` leaves no timer behind to
    // clean up a listener that resolves through another caller's poll.
    let block = 100n
    const client_ = createPublicClient({
      chain: mainnet,
      transport: custom({
        async request({ method }) {
          if (method === 'eth_blockNumber') return `0x${(block++).toString(16)}`
          if (method === 'eth_getTransactionReceipt')
            return block > 102n ? receipt : null
          throw new Error(`unexpected ${method}`)
        },
      }),
      pollingInterval: 20,
    })

    const [first, second] = await Promise.all([
      client_.waitForTransactionReceipt({
        hash,
        timeout: 0,
        checkReplacement: false,
      }),
      client_.waitForTransactionReceipt({
        hash,
        timeout: 0,
        checkReplacement: false,
      }),
    ])
    expect(first.transactionHash).toBe(hash)
    expect(second.transactionHash).toBe(hash)

    await expectHash(
      client_.waitForTransactionReceipt({
        hash,
        timeout: 0,
        checkReplacement: false,
      }),
    )
  })
})

describe('chain: transactionReplacement', () => {
  test('ignores a same-nonce transaction in a different slot', async () => {
    setup()

    await mine(client, { blocks: 10 })

    const nonce = hexToNumber(
      (await client.request({
        method: 'eth_getTransactionCount',
        params: [sourceAccount.address, 'latest'],
      })) ?? '0x0',
    )

    const hash = await sendTransaction(client, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
      maxFeePerGas: parseGwei('10'),
      nonce,
    })
    const slotClient = createPublicClient({
      chain: {
        ...anvilMainnet.chain,
        transactionReplacement: {
          getKey: (transaction) =>
            transaction.hash === hash ? 'awaited' : 'other',
        },
      } satisfies Chain,
      pollingInterval: 100,
      transport: http(anvilMainnet.rpcUrl.http),
    })
    const replacements: ReplacementReturnType[] = []

    const receiptPromise = waitForTransactionReceipt(slotClient, {
      hash,
      onReplaced: (replacement) => replacements.push(replacement),
      timeout: 3000,
    })
    await wait(500)
    await sendTransaction(client, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
      maxFeePerGas: parseGwei('20'),
      nonce,
    })

    await expect(receiptPromise).rejects.toThrowError(
      WaitForTransactionReceiptTimeoutError,
    )
    expect(replacements).toMatchInlineSnapshot('[]')
  })

  test('uses the chain replacement reason', async () => {
    setup()

    await mine(client, { blocks: 10 })

    const nonce = hexToNumber(
      (await client.request({
        method: 'eth_getTransactionCount',
        params: [sourceAccount.address, 'latest'],
      })) ?? '0x0',
    )

    const hash = await sendTransaction(client, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
      maxFeePerGas: parseGwei('10'),
      nonce,
    })
    const reasonClient = createPublicClient({
      chain: {
        ...anvilMainnet.chain,
        transactionReplacement: {
          getKey: () => 'slot',
          getReason: () => 'cancelled',
        },
      } satisfies Chain,
      pollingInterval: 100,
      transport: http(anvilMainnet.rpcUrl.http),
    })
    const replacements: ReplacementReturnType[] = []

    const [receipt, replacementHash] = await Promise.all([
      waitForTransactionReceipt(reasonClient, {
        hash,
        onReplaced: (replacement) => replacements.push(replacement),
      }),
      (async () => {
        await wait(500)
        return sendTransaction(client, {
          account: sourceAccount.address,
          to: targetAccount.address,
          value: parseEther('1'),
          maxFeePerGas: parseGwei('20'),
          nonce,
        })
      })(),
    ])

    expect(receipt.transactionHash).toBe(replacementHash)
    expect(replacements.map(({ reason }) => reason)).toMatchInlineSnapshot(`
      [
        "cancelled",
      ]
    `)
  })

  test('does not search for a replacement of a mined transaction', async () => {
    const pool = Pool.define({
      instance: Instance.anvil({ chainId: mainnet.id, noMining: true }),
    })
    onTestFinished(() => pool.destroyAll())
    const node = await pool.start(1)
    const laggingNode = await pool.start(2)
    const minedClient = createTestClient({
      chain: mainnet,
      mode: 'anvil',
      transport: http(node.url),
    })
    const laggingClient = createPublicClient({
      transport: http(laggingNode.url),
    })
    const hash = await sendTransaction(minedClient, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
    })
    // A sibling in the same block shares the awaited transaction's slot.
    await sendTransaction(minedClient, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('2'),
    })
    await mine(minedClient, { blocks: 1 })
    const receipt = await getTransactionReceipt(minedClient, { hash })
    await setIntervalMining(minedClient, { interval: 1 })

    // Route receipt reads to a lagging node while transaction and block reads are current.
    let missingReceipts = 3
    const client = createPublicClient({
      chain: {
        ...mainnet,
        transactionReplacement: { getKey: () => 'slot' },
      },
      pollingInterval: 50,
      transport: custom({
        request(options) {
          if (
            options.method === 'eth_getTransactionReceipt' &&
            missingReceipts-- > 0
          )
            return laggingClient.request(options)
          return minedClient.request(options)
        },
      }),
    })
    const replacements: ReplacementReturnType[] = []

    const result = await client.waitForTransactionReceipt({
      hash,
      onReplaced: (replacement) => replacements.push(replacement),
      timeout: 10_000,
    })

    expect(result).toEqual(receipt)
    expect(replacements).toMatchInlineSnapshot('[]')
  })
})

/**
 * Sends a transaction and a cancel at its nonce to an isolated node, which
 * drops the transaction from its pool, then mines the cancel.
 */
async function replaceTransaction(options: { blocks: number }) {
  const pool = Pool.define({
    instance: Instance.anvil({ chainId: mainnet.id, noMining: true }),
  })
  onTestFinished(() => pool.destroyAll())
  const node = await pool.start(1)
  const testClient = createTestClient({
    chain: mainnet,
    mode: 'anvil',
    transport: http(node.url),
  })

  const hash = await sendTransaction(testClient, {
    account: sourceAccount.address,
    maxFeePerGas: parseGwei('2'),
    maxPriorityFeePerGas: parseGwei('1'),
    nonce: 0,
    to: targetAccount.address,
    value: parseEther('1'),
  })
  const cancelHash = await sendTransaction(testClient, {
    account: sourceAccount.address,
    maxFeePerGas: parseGwei('20'),
    maxPriorityFeePerGas: parseGwei('10'),
    nonce: 0,
    to: sourceAccount.address,
    value: 0n,
  })
  await mine(testClient, { blocks: options.blocks })

  return { cancelHash, hash, pool, rpcUrl: node.url, testClient }
}

/**
 * Serves JSON-RPC on an ephemeral HTTP server that forwards each request to
 * `url`, or responds with the error that `getError` returns for it.
 */
async function createRpcProxy(
  url: string,
  getError: (request: {
    method: string
    params: readonly unknown[]
  }) => { code: number; message: string } | undefined,
) {
  const server = await createHttpServer(async (req, res) => {
    let body = ''
    for await (const chunk of req) body += chunk
    const request = JSON.parse(body)
    const error = getError(request)

    res.setHeader('Content-Type', 'application/json')
    if (error) {
      res.end(JSON.stringify({ error, id: request.id, jsonrpc: '2.0' }))
      return
    }
    const response = await fetch(url, {
      body,
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    res.end(await response.text())
  })
  onTestFinished(async () => {
    await server.close()
  })
  return server.url
}
