import { describe, expect, test, vi } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { publicClient, testClient, walletClient } from '~test/src/utils.js'
import { WaitForTransactionReceiptTimeoutError } from '../../errors/transaction.js'
import { hexToNumber } from '../../utils/encoding/fromHex.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { parseGwei } from '../../utils/unit/parseGwei.js'
import { wait } from '../../utils/wait.js'
import { mine } from '../test/mine.js'
import { sendTransaction } from '../wallet/sendTransaction.js'

import { setIntervalMining } from '../index.js'
import * as getBlock from './getBlock.js'
import { waitForTransactionReceipt } from './waitForTransactionReceipt.js'

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

async function setup() {
  await setIntervalMining(testClient, { interval: 1 })
}

test('waits for transaction (send -> wait -> mine)', async () => {
  setup()

  const hash = await sendTransaction(walletClient, {
    account: sourceAccount.address,
    to: targetAccount.address,
    value: parseEther('1'),
  })
  const { status } = await waitForTransactionReceipt(publicClient, {
    hash,
  })
  expect(status).toBe('success')
})

test('waits for transaction (send -> mine -> wait)', async () => {
  setup()

  const hash = await sendTransaction(walletClient, {
    account: sourceAccount.address,
    to: targetAccount.address,
    value: parseEther('1'),
  })
  await mine(testClient, { blocks: 1 })
  const { status } = await waitForTransactionReceipt(publicClient, {
    hash,
  })
  expect(status).toBe('success')
})

test('waits for transaction (multiple waterfall)', async () => {
  setup()

  const hash = await sendTransaction(walletClient, {
    account: sourceAccount.address,
    to: targetAccount.address,
    value: parseEther('1'),
  })
  const receipt_1 = await waitForTransactionReceipt(publicClient, {
    hash,
  })
  const receipt_2 = await waitForTransactionReceipt(publicClient, {
    hash,
  })
  const receipt_3 = await waitForTransactionReceipt(publicClient, {
    hash,
  })
  const receipt_4 = await waitForTransactionReceipt(publicClient, {
    hash,
  })
  expect(receipt_1).toEqual(receipt_2)
  expect(receipt_2).toEqual(receipt_3)
  expect(receipt_3).toEqual(receipt_4)
})

test('waits for transaction (multiple parallel)', async () => {
  setup()

  const hash = await sendTransaction(walletClient, {
    account: sourceAccount.address,
    to: targetAccount.address,
    value: parseEther('1'),
  })
  const [receipt_1, receipt_2, receipt_3, receipt_4] = await Promise.all([
    waitForTransactionReceipt(publicClient, {
      hash,
    }),
    waitForTransactionReceipt(publicClient, {
      hash,
    }),
    waitForTransactionReceipt(publicClient, {
      hash,
    }),
    waitForTransactionReceipt(publicClient, {
      hash,
    }),
  ])
  expect(receipt_1).toEqual(receipt_2)
  expect(receipt_2).toEqual(receipt_3)
  expect(receipt_3).toEqual(receipt_4)
})

describe('replaced transactions', () => {
  test('repriced', async () => {
    setup()

    await mine(testClient, { blocks: 10 })

    const nonce = hexToNumber(
      (await publicClient.request({
        method: 'eth_getTransactionCount',
        params: [sourceAccount.address, 'latest'],
      })) ?? '0x0',
    )

    const hash = await sendTransaction(walletClient, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
      maxFeePerGas: parseGwei('10'),
      nonce,
    })

    let replacement: any
    const [receipt] = await Promise.all([
      waitForTransactionReceipt(publicClient, {
        hash,
        onReplaced: (replacement_) => (replacement = replacement_),
      }),
      (async () => {
        await wait(100)

        // speed up
        await sendTransaction(walletClient, {
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

    await mine(testClient, { blocks: 10 })

    const nonce = hexToNumber(
      (await publicClient.request({
        method: 'eth_getTransactionCount',
        params: [sourceAccount.address, 'latest'],
      })) ?? '0x0',
    )

    const hash = await sendTransaction(walletClient, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
      maxFeePerGas: parseGwei('10'),
      nonce,
    })

    const [receipt] = await Promise.all([
      waitForTransactionReceipt(publicClient, {
        hash,
      }),
      (async () => {
        await wait(100)

        // speed up
        await sendTransaction(walletClient, {
          account: sourceAccount.address,
          to: targetAccount.address,
          value: parseEther('1'),
          nonce,
          maxFeePerGas: parseGwei('20'),
        })

        await wait(1000)
        await mine(testClient, { blocks: 5 })
      })(),
    ])

    expect(receipt !== null).toBeTruthy()
  })

  test('cancelled', async () => {
    setup()

    await mine(testClient, { blocks: 10 })

    const nonce = hexToNumber(
      (await publicClient.request({
        method: 'eth_getTransactionCount',
        params: [sourceAccount.address, 'latest'],
      })) ?? '0x0',
    )

    const hash = await sendTransaction(walletClient, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
      maxFeePerGas: parseGwei('10'),
      nonce,
    })

    let replacement: any
    const [receipt] = await Promise.all([
      waitForTransactionReceipt(publicClient, {
        hash,
        onReplaced: (replacement_) => (replacement = replacement_),
      }),
      (async () => {
        await wait(100)

        // speed up
        await sendTransaction(walletClient, {
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

    await mine(testClient, { blocks: 10 })

    const nonce = hexToNumber(
      (await publicClient.request({
        method: 'eth_getTransactionCount',
        params: [sourceAccount.address, 'latest'],
      })) ?? '0x0',
    )

    const hash = await sendTransaction(walletClient, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
      maxFeePerGas: parseGwei('10'),
      nonce,
    })

    let replacement: any
    const [receipt] = await Promise.all([
      waitForTransactionReceipt(publicClient, {
        hash,
        onReplaced: (replacement_) => (replacement = replacement_),
      }),
      (async () => {
        await wait(100)

        // speed up
        await sendTransaction(walletClient, {
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

    const hash = await sendTransaction(walletClient, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
      maxFeePerGas: parseGwei('10'),
    })

    const start = Date.now()
    const receipt = await waitForTransactionReceipt(publicClient, {
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

    await mine(testClient, { blocks: 10 })

    const nonce = hexToNumber(
      (await publicClient.request({
        method: 'eth_getTransactionCount',
        params: [sourceAccount.address, 'latest'],
      })) ?? '0x0',
    )

    const hash = await sendTransaction(walletClient, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
      maxFeePerGas: parseGwei('10'),
      nonce,
    })

    const [receipt] = await Promise.all([
      waitForTransactionReceipt(publicClient, {
        confirmations: 3,
        hash,
      }),
      (async () => {
        await wait(100)

        // speed up
        await sendTransaction(walletClient, {
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

  const hash = await sendTransaction(walletClient, {
    account: sourceAccount.address,
    to: targetAccount.address,
    value: parseEther('1'),
  })
  await expect(() =>
    waitForTransactionReceipt(publicClient, {
      hash,
      timeout: 500,
    }),
  ).rejects.toThrowError(WaitForTransactionReceiptTimeoutError)
})

describe('errors', () => {
  test('throws when transaction replaced and getBlock fails', async () => {
    setup()

    vi.spyOn(getBlock, 'getBlock').mockRejectedValueOnce(new Error('foo'))

    await mine(testClient, { blocks: 10 })

    const nonce = hexToNumber(
      (await publicClient.request({
        method: 'eth_getTransactionCount',
        params: [sourceAccount.address, 'latest'],
      })) ?? '0x0',
    )

    const hash = await sendTransaction(walletClient, {
      account: sourceAccount.address,
      to: targetAccount.address,
      value: parseEther('1'),
      maxFeePerGas: parseGwei('10'),
      nonce,
    })

    await expect(() =>
      Promise.all([
        waitForTransactionReceipt(publicClient, {
          hash,
        }),
        (async () => {
          await wait(100)

          // speed up
          await sendTransaction(walletClient, {
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
