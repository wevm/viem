import { Instance, Pool } from 'prool'
import {
  createPublicClient,
  createTestClient,
  custom,
  http,
  type ReplacementReturnType,
} from 'viem'
import { getTransactionReceipt } from 'viem/actions'
import { describe, expect, onTestFinished, test, vi } from 'vitest'
import { anvilMainnet } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { mainnet } from '../../chains/index.js'
import { WaitForTransactionReceiptTimeoutError } from '../../errors/transaction.js'
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
