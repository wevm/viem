import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
  getSmartAccounts_06,
  getSmartAccounts_07,
} from '../../../../test/src/account-abstraction.js'
import { anvilMainnet } from '../../../../test/src/anvil.js'
import { bundlerMainnet } from '../../../../test/src/bundler.js'
import { mine } from '../../../actions/index.js'
import { parseEther, parseGwei } from '../../../utils/index.js'
import { wait } from '../../../utils/wait.js'
import * as getUserOperationReceipt from './getUserOperationReceipt.js'
import { sendUserOperation } from './sendUserOperation.js'
import { waitForUserOperationReceipt } from './waitForUserOperationReceipt.js'

const client = anvilMainnet.getClient({ account: true })
const bundlerClient = bundlerMainnet.getBundlerClient()

const fees = {
  maxFeePerGas: parseGwei('7'),
  maxPriorityFeePerGas: parseGwei('1'),
} as const

beforeEach(async () => {
  await bundlerMainnet.restart()
})

describe('entryPointVersion: 0.7', async () => {
  const [account] = await getSmartAccounts_07()

  test('default', async () => {
    const hash = await sendUserOperation(bundlerClient, {
      account,
      calls: [
        {
          to: '0x0000000000000000000000000000000000000000',
          value: parseEther('1'),
        },
      ],
      ...fees,
    })

    const [receipt] = await Promise.all([
      waitForUserOperationReceipt(bundlerClient, {
        hash,
      }),
      (async () => {
        // Simulate some delay to send the bundle + mine block.
        await wait(100)
        await bundlerClient.request({
          method: 'debug_bundler_sendBundleNow',
        })
        await mine(client, {
          blocks: 1,
        })
      })(),
    ])

    expect(receipt.success).toBeTruthy()
  })

  test('args: pollingInterval', async () => {
    const hash = await sendUserOperation(bundlerClient, {
      account,
      calls: [
        {
          to: '0x0000000000000000000000000000000000000000',
          value: parseEther('1'),
        },
      ],
      ...fees,
    })

    const [receipt] = await Promise.all([
      waitForUserOperationReceipt(bundlerClient, {
        hash,
        pollingInterval: 100,
      }),
      (async () => {
        // Simulate some delay to send the bundle + mine block.
        await wait(100)
        await bundlerClient.request({
          method: 'debug_bundler_sendBundleNow',
        })
        await mine(client, {
          blocks: 1,
        })
      })(),
    ])

    expect(receipt.success).toBeTruthy()
  })

  test('error: retryCount exceeded', async () => {
    const hash = await sendUserOperation(bundlerClient, {
      account,
      calls: [
        {
          to: '0x0000000000000000000000000000000000000000',
          value: parseEther('1'),
        },
      ],
      ...fees,
    })

    await expect(() =>
      Promise.all([
        waitForUserOperationReceipt(bundlerClient, {
          hash,
          retryCount: 6,
        }),
        (async () => {
          // Simulate some delay
          await wait(500)
        })(),
      ]),
    ).rejects.toThrowError('Timed out while waiting for User Operation')
  })

  test('error: timeout exceeded', async () => {
    const hash = await sendUserOperation(bundlerClient, {
      account,
      calls: [
        {
          to: '0x0000000000000000000000000000000000000000',
          value: parseEther('1'),
        },
      ],
      ...fees,
    })

    await expect(() =>
      Promise.all([
        waitForUserOperationReceipt(bundlerClient, {
          hash,
          timeout: 100,
        }),
        (async () => {
          // Simulate some delay
          await wait(500)
        })(),
      ]),
    ).rejects.toThrowError('Timed out while waiting for User Operation')
  })

  test('error: generic error', async () => {
    const hash = await sendUserOperation(bundlerClient, {
      account,
      calls: [
        {
          to: '0x0000000000000000000000000000000000000000',
          value: parseEther('1'),
        },
      ],
      ...fees,
    })

    vi.spyOn(
      getUserOperationReceipt,
      'getUserOperationReceipt',
    ).mockRejectedValueOnce(new Error('test'))

    await expect(() =>
      Promise.all([
        waitForUserOperationReceipt(bundlerClient, {
          hash,
        }),
        (async () => {
          // Simulate some delay to send the bundle + mine block.
          await wait(100)
          await bundlerClient.request({
            method: 'debug_bundler_sendBundleNow',
          })
          await mine(client, {
            blocks: 1,
          })
        })(),
      ]),
    ).rejects.toMatchInlineSnapshot(`
      [Error: test]
    `)
  })
})

describe('entryPointVersion: 0.6', async () => {
  const [account] = await getSmartAccounts_06()

  test('default', async () => {
    const hash = await sendUserOperation(bundlerClient, {
      account,
      calls: [
        {
          to: '0x0000000000000000000000000000000000000000',
          value: parseEther('1'),
        },
      ],
      ...fees,
    })

    const [receipt] = await Promise.all([
      waitForUserOperationReceipt(bundlerClient, {
        hash,
      }),
      (async () => {
        // Simulate some delay to send the bundle + mine block.
        await wait(50)
        await bundlerClient.request({
          method: 'debug_bundler_sendBundleNow',
        })
        await mine(client, {
          blocks: 1,
        })
      })(),
    ])

    expect(receipt.success).toBeTruthy()
  })
})
