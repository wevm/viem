import { accounts } from '../../_test/constants.js'
import { publicClient, testClient, walletClient } from '../../_test/utils.js'
import { WaitForTransactionReceiptTimeoutError } from '../../errors/transaction.js'
import { hexToNumber } from '../../utils/encoding/fromHex.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { parseGwei } from '../../utils/unit/parseGwei.js'
import { wait } from '../../utils/wait.js'
import { mine } from '../test/mine.js'
import { setIntervalMining } from '../test/setIntervalMining.js'
import { sendTransaction } from '../wallet/sendTransaction.js'
import { waitForTransactionReceipt } from './waitForTransactionReceipt.js'
import { describe, expect, test } from 'vitest'

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

test('waits for transaction (send -> wait -> mine)', async () => {
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

describe('replaced transactions', () => {
  test('repriced', async () => {
    await mine(testClient, { blocks: 10 })
    await setIntervalMining(testClient, { interval: 0 })

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

        await setIntervalMining(testClient, { interval: 1 })
      })(),
    ])

    expect(receipt !== null).toBeTruthy()
    expect(replacement.reason).toBe('repriced')
    expect(replacement.replacedTransaction).toBeDefined()
    expect(replacement.transaction).toBeDefined()
    expect(replacement.transactionReceipt).toBeDefined()
  })

  test('repriced (skipped blocks)', async () => {
    await mine(testClient, { blocks: 10 })
    await setIntervalMining(testClient, { interval: 0 })

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

    await setIntervalMining(testClient, { interval: 1 })
  })

  test('cancelled', async () => {
    await mine(testClient, { blocks: 10 })
    await setIntervalMining(testClient, { interval: 0 })

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

        await setIntervalMining(testClient, { interval: 1 })
      })(),
    ])

    expect(receipt !== null).toBeTruthy()
    expect(replacement.reason).toBe('cancelled')
    expect(replacement.replacedTransaction).toBeDefined()
    expect(replacement.transaction).toBeDefined()
    expect(replacement.transactionReceipt).toBeDefined()
  })

  test('replaced', async () => {
    await mine(testClient, { blocks: 10 })
    await setIntervalMining(testClient, { interval: 0 })

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

        await setIntervalMining(testClient, { interval: 1 })
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
    await mine(testClient, { blocks: 10 })
    await setIntervalMining(testClient, { interval: 0 })

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
        await setIntervalMining(testClient, { interval: 1 })
      })(),
    ])

    expect(receipt !== null).toBeTruthy()
  })
})

test('args: timeout', async () => {
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
  test('throws when transaction not found', async () => {
    await expect(() =>
      waitForTransactionReceipt(publicClient, {
        hash: '0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98f',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "Transaction with hash \\"0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98f\\" could not be found.

      Version: viem@1.0.2"
    `)
  })
})
