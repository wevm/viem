import { describe, expect, test, vi } from 'vitest'
import { anvilMainnet } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { prepareTransactionRequest } from '../../actions/index.js'
import { WaitForTransactionReceiptTimeoutError } from '../../errors/transaction.js'
import { hexToNumber } from '../../utils/encoding/fromHex.js'
import { keccak256 } from '../../utils/index.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { parseGwei } from '../../utils/unit/parseGwei.js'
import { wait } from '../../utils/wait.js'
import {
  sendRawTransaction,
  setIntervalMining,
  signTransaction,
} from '../index.js'
import { mine } from '../test/mine.js'
import { sendTransaction } from '../wallet/sendTransaction.js'
import * as getBlock from './getBlock.js'
import * as getTransactionModule from './getTransaction.js'
import { waitForTransactionReceipt } from './waitForTransactionReceipt.js'

const client = anvilMainnet.getClient()

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

async function setup() {
  await setIntervalMining(client, { interval: 1 })
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
  const getTransaction = vi.spyOn(getTransactionModule, 'getTransaction')

  // create a transaction to use it only as a template for the mocks

  const templateHash = await sendTransaction(client, {
    account: sourceAccount.address,
    to: targetAccount.address,
    value: parseEther('1'),
  })
  await mine(client, { blocks: 1 })
  await wait(200)

  const template = await getTransactionModule.getTransaction(client, {
    hash: templateHash,
  })

  // Prepare and calculate hash of problematic transaction. Will send it later

  const prepareProblematic = await prepareTransactionRequest(client, {
    account: privateKeyToAccount(accounts[0].privateKey),
    to: targetAccount.address,
    value: parseEther('1'),
  })
  const problematicTx = await signTransaction(client, prepareProblematic)
  const problematicTxHash = keccak256(problematicTx)

  // Prepare a good transaction. Will send it later

  const prepareGood = await prepareTransactionRequest(client, {
    account: privateKeyToAccount(accounts[0].privateKey),
    to: targetAccount.address,
    value: parseEther('0.0001'),
    nonce: prepareProblematic.nonce + 1,
  })
  const goodTx = await signTransaction(client, prepareGood)
  const goodTxHash = keccak256(goodTx)

  // important step: we need to mock the getTransaction to simulate a transaction that is in the mempool but
  // is not yet mined.
  getTransaction.mockResolvedValueOnce({
    ...template,
    hash: goodTxHash,
    nonce: 1233,
  })

  // Start looking for the receipt of the good transaction but did not send it yet. Here it will start polling
  const goodReceiptPromise = waitForTransactionReceipt(client, {
    hash: goodTxHash,
    timeout: 5000,
    retryCount: 0,
  })
  await wait(200)

  // to simulate a transaction that is in the mempool but not yet mined
  getTransaction.mockResolvedValueOnce({
    ...template,
    hash: problematicTxHash,
    nonce: 1234,
  })

  // Start polling the problematic transaction receipt
  waitForTransactionReceipt(client, { hash: problematicTxHash, retryCount: 0 })
  await mine(client, { blocks: 1 })
  await wait(200)

  // Send the problematic transaction and mine it so we will have the receipt
  await sendRawTransaction(client, { serializedTransaction: problematicTx })
  await wait(200)

  // important step: Mine a bunch of blocks together to trigger getTransactionReceipt many times for the same receipt.
  // getting many receipt will trigger many unwatch from the same listener
  await mine(client, { blocks: 1000 })
  await wait(200)

  // Send good transaction and mine, if the polling is working fine should get the receipt but if not we will get a timeout.
  await sendRawTransaction(client, { serializedTransaction: goodTx })
  await mine(client, { blocks: 1 })
  await wait(200)

  await mine(client, { blocks: 1 })
  await wait(200)

  const { status } = await goodReceiptPromise
  expect(status).toBe('success')
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

  test('checkReplacement: false', async () => {
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

    let replacementCalled = false
    const receiptPromise = waitForTransactionReceipt(client, {
      hash,
      checkReplacement: false,
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
    expect(end - start).toBeGreaterThan(3000 - 100)
    expect(end - start).toBeLessThanOrEqual(3000 + 100)
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

test('args: requestOptions.signal (already aborted)', async () => {
  setup()

  const hash = await sendTransaction(client, {
    account: sourceAccount.address,
    to: targetAccount.address,
    value: parseEther('1'),
  })

  const controller = new AbortController()
  controller.abort()

  await expect(() =>
    waitForTransactionReceipt(client, {
      hash,
      requestOptions: { signal: controller.signal },
    }),
  ).rejects.toThrow('This operation was aborted')
})

test('args: requestOptions.signal (aborted during wait)', async () => {
  setup()

  const hash = await sendTransaction(client, {
    account: sourceAccount.address,
    to: targetAccount.address,
    value: parseEther('1'),
  })

  const controller = new AbortController()

  const receiptPromise = waitForTransactionReceipt(client, {
    hash,
    pollingInterval: 50,
    timeout: 10_000,
    requestOptions: { signal: controller.signal },
  })

  await wait(100)
  controller.abort()

  const start = Date.now()
  await expect(() => receiptPromise).rejects.toThrow()
  const elapsed = Date.now() - start

  expect(elapsed).toBeLessThan(2000)
})

describe('errors', () => {
  test('throws when transaction replaced and getBlock fails', async () => {
    setup()

    vi.spyOn(getBlock, 'getBlock').mockRejectedValueOnce(new Error('foo'))

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
