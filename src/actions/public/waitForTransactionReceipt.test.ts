import { describe, expect, test, vi } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { WaitForTransactionReceiptTimeoutError } from '../../errors/transaction.js'
import { hexToNumber } from '../../utils/encoding/fromHex.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { parseGwei } from '../../utils/unit/parseGwei.js'
import { wait } from '../../utils/wait.js'
import { mine } from '../test/mine.js'
import { sendTransaction } from '../wallet/sendTransaction.js'

import { anvilMainnet } from '../../../test/src/anvil.js'

import { privateKeyToAccount } from '~viem/accounts/privateKeyToAccount.js'
import { keccak256 } from '~viem/utils/index.js'
import { prepareTransactionRequest } from '../../actions/index.js'
import {
  sendRawTransaction,
  setIntervalMining,
  signTransaction,
} from '../index.js'
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
        await wait(100)

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
        await wait(100)

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
        await wait(100)

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
        await wait(100)

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
        await wait(100)

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
          await wait(100)

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
