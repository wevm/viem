import { describe, expect, test } from 'vitest'

import { accounts, publicClient, testClient, walletClient } from '../../../test'
import { wait } from '../../utils/wait'
import {
  WaitForTransactionReceiptTimeoutError,
  waitForTransactionReceipt,
} from './waitForTransactionReceipt'
import { etherToValue, gweiToValue, hexToNumber } from '../../utils'
import { sendTransaction } from './sendTransaction'
import { mine } from '../test'

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

test('waits for transaction (send -> wait -> mine)', async () => {
  const { hash } = await sendTransaction(walletClient, {
    request: {
      from: sourceAccount.address,
      to: targetAccount.address,
      value: etherToValue('1'),
    },
  })
  const { status } = await waitForTransactionReceipt(publicClient, {
    hash,
  })
  expect(status).toBe('success')
}, 10_000)

test('waits for transaction (send -> mine -> wait)', async () => {
  const { hash } = await sendTransaction(walletClient, {
    request: {
      from: sourceAccount.address,
      to: targetAccount.address,
      value: etherToValue('1'),
    },
  })
  await mine(testClient, { blocks: 1 })
  const { status } = await waitForTransactionReceipt(publicClient, {
    hash,
  })
  expect(status).toBe('success')
}, 10_000)

describe('replaced transactions', () => {
  test('repriced', async () => {
    await mine(testClient, { blocks: 10 })
    await testClient.request({ method: 'evm_setIntervalMining', params: [99] })

    const nonce = hexToNumber(
      (await publicClient.request({
        method: 'eth_getTransactionCount',
        params: [sourceAccount.address, 'latest'],
      })) ?? '0x0',
    )

    const { hash } = await sendTransaction(walletClient, {
      request: {
        from: sourceAccount.address,
        to: targetAccount.address,
        value: etherToValue('1'),
        maxFeePerGas: gweiToValue('10'),
        nonce,
      },
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
          request: {
            from: sourceAccount.address,
            to: targetAccount.address,
            value: etherToValue('1'),
            nonce,
            maxFeePerGas: gweiToValue('20'),
          },
        })

        await testClient.request({
          method: 'evm_setIntervalMining',
          params: [1],
        })
      })(),
    ])

    expect(receipt !== null).toBeTruthy()
    expect(replacement.reason).toBe('repriced')
    expect(replacement.replacedTransaction).toBeDefined()
    expect(replacement.transaction).toBeDefined()
    expect(replacement.transactionReceipt).toBeDefined()
  }, 10_000)

  test('repriced (skipped blocks)', async () => {
    await mine(testClient, { blocks: 10 })
    await testClient.request({ method: 'evm_setIntervalMining', params: [99] })

    const nonce = hexToNumber(
      (await publicClient.request({
        method: 'eth_getTransactionCount',
        params: [sourceAccount.address, 'latest'],
      })) ?? '0x0',
    )

    const { hash } = await sendTransaction(walletClient, {
      request: {
        from: sourceAccount.address,
        to: targetAccount.address,
        value: etherToValue('1'),
        maxFeePerGas: gweiToValue('10'),
        nonce,
      },
    })

    const [receipt] = await Promise.all([
      waitForTransactionReceipt(publicClient, {
        hash,
      }),
      (async () => {
        await wait(100)

        // speed up
        await sendTransaction(walletClient, {
          request: {
            from: sourceAccount.address,
            to: targetAccount.address,
            value: etherToValue('1'),
            nonce,
            maxFeePerGas: gweiToValue('20'),
          },
        })

        await wait(1000)
        await mine(testClient, { blocks: 5 })
      })(),
    ])

    expect(receipt !== null).toBeTruthy()

    await testClient.request({ method: 'evm_setIntervalMining', params: [1] })
  }, 10_000)

  test('cancelled', async () => {
    await mine(testClient, { blocks: 10 })
    await testClient.request({ method: 'evm_setIntervalMining', params: [99] })

    const nonce = hexToNumber(
      (await publicClient.request({
        method: 'eth_getTransactionCount',
        params: [sourceAccount.address, 'latest'],
      })) ?? '0x0',
    )

    const { hash } = await sendTransaction(walletClient, {
      request: {
        from: sourceAccount.address,
        to: targetAccount.address,
        value: etherToValue('1'),
        maxFeePerGas: gweiToValue('10'),
        nonce,
      },
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
          request: {
            from: sourceAccount.address,
            to: sourceAccount.address,
            value: etherToValue('0'),
            nonce,
            maxFeePerGas: gweiToValue('20'),
          },
        })

        await testClient.request({
          method: 'evm_setIntervalMining',
          params: [1],
        })
      })(),
    ])

    expect(receipt !== null).toBeTruthy()
    expect(replacement.reason).toBe('cancelled')
    expect(replacement.replacedTransaction).toBeDefined()
    expect(replacement.transaction).toBeDefined()
    expect(replacement.transactionReceipt).toBeDefined()
  }, 10_000)

  test('replaced', async () => {
    await mine(testClient, { blocks: 10 })
    await testClient.request({ method: 'evm_setIntervalMining', params: [99] })

    const nonce = hexToNumber(
      (await publicClient.request({
        method: 'eth_getTransactionCount',
        params: [sourceAccount.address, 'latest'],
      })) ?? '0x0',
    )

    const { hash } = await sendTransaction(walletClient, {
      request: {
        from: sourceAccount.address,
        to: targetAccount.address,
        value: etherToValue('1'),
        maxFeePerGas: gweiToValue('10'),
        nonce,
      },
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
          request: {
            from: sourceAccount.address,
            to: targetAccount.address,
            value: etherToValue('2'),
            nonce,
            maxFeePerGas: gweiToValue('20'),
          },
        })

        await testClient.request({
          method: 'evm_setIntervalMining',
          params: [1],
        })
      })(),
    ])

    expect(receipt !== null).toBeTruthy()
    expect(replacement.reason).toBe('replaced')
    expect(replacement.replacedTransaction).toBeDefined()
    expect(replacement.transaction).toBeDefined()
    expect(replacement.transactionReceipt).toBeDefined()
  }, 10_000)
})

describe('args: confirmations', () => {
  test('waits for confirmations', async () => {
    const { hash } = await sendTransaction(walletClient, {
      request: {
        from: sourceAccount.address,
        to: targetAccount.address,
        value: etherToValue('1'),
        maxFeePerGas: gweiToValue('10'),
      },
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
  }, 10_000)

  test('waits for confirmations (replaced)', async () => {
    await mine(testClient, { blocks: 10 })
    await testClient.request({ method: 'evm_setIntervalMining', params: [99] })

    const nonce = hexToNumber(
      (await publicClient.request({
        method: 'eth_getTransactionCount',
        params: [sourceAccount.address, 'latest'],
      })) ?? '0x0',
    )

    const { hash } = await sendTransaction(walletClient, {
      request: {
        from: sourceAccount.address,
        to: targetAccount.address,
        value: etherToValue('1'),
        maxFeePerGas: gweiToValue('10'),
        nonce,
      },
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
          request: {
            from: sourceAccount.address,
            to: targetAccount.address,
            value: etherToValue('1'),
            nonce,
            maxFeePerGas: gweiToValue('20'),
          },
        })

        await wait(1000)
        await testClient.request({
          method: 'evm_setIntervalMining',
          params: [1],
        })
      })(),
    ])

    expect(receipt !== null).toBeTruthy()
  }, 10_000)
})

test('args: timeout', async () => {
  const { hash } = await sendTransaction(walletClient, {
    request: {
      from: sourceAccount.address,
      to: targetAccount.address,
      value: etherToValue('1'),
    },
  })
  await expect(() =>
    waitForTransactionReceipt(publicClient, {
      hash,
      timeout: 500,
    }),
  ).rejects.toThrowError(WaitForTransactionReceiptTimeoutError)
}, 10_000)

describe('errors', () => {
  test('throws when transaction not found', async () => {
    await expect(() =>
      waitForTransactionReceipt(publicClient, {
        hash: '0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98f',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "Transaction with hash \\"0xa4b1f606b66105fa45cb5db23d2f6597075701e7f0e2367f4e6a39d17a8cf98f\\" could not be found.

      Details: transaction not found
      Version: viem@1.0.2"
    `)
  }, 10_000)
})

test('WaitForTransactionReceiptTimeoutError', () => {
  expect(() => {
    throw new WaitForTransactionReceiptTimeoutError({ hash: '0x123' })
  }).toThrowError(WaitForTransactionReceiptTimeoutError)
})
