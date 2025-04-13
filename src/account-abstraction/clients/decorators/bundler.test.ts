import { beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { getSmartAccounts_07 } from '../../../../test/src/account-abstraction.js'
import { anvilMainnet } from '../../../../test/src/anvil.js'
import { bundlerMainnet } from '../../../../test/src/bundler.js'
import type { ToSoladySmartAccountReturnType } from '../../../account-abstraction/accounts/implementations/toSoladySmartAccount.js'
import type { entryPoint07Abi } from '../../../account-abstraction/constants/abis.js'
import { mine, reset } from '../../../actions/index.js'
import { bundlerActions } from './bundler.js'

const client = anvilMainnet.getClient().extend(bundlerActions)
const bundlerClient = bundlerMainnet.getBundlerClient().extend(bundlerActions)

beforeEach(async () => {
  await bundlerMainnet.restart()
})

test('default', async () => {
  expect(bundlerActions(bundlerClient)).toMatchInlineSnapshot(`
    {
      "estimateUserOperationGas": [Function],
      "getChainId": [Function],
      "getSupportedEntryPoints": [Function],
      "getUserOperation": [Function],
      "getUserOperationReceipt": [Function],
      "prepareUserOperation": [Function],
      "sendUserOperation": [Function],
      "waitForUserOperationReceipt": [Function],
    }
  `)
})

describe('smoke', async () => {
  let account: ToSoladySmartAccountReturnType<typeof entryPoint07Abi, '0.7'>
  beforeAll(async () => {
    await reset(client, {
      blockNumber: 22239294n,
      jsonRpcUrl: anvilMainnet.forkUrl,
    })

    // Get smart accounts after reset is complete
    const accounts = await getSmartAccounts_07()
    account = accounts[0]
  })

  test('estimateUserOperationGas', async () => {
    await bundlerClient.estimateUserOperationGas({
      account,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
    })
  })

  test('getChainId', async () => {
    expect(await bundlerClient.getChainId()).toMatchInlineSnapshot('1')
  })

  test('getSupportedEntryPoints', async () => {
    await bundlerClient.getSupportedEntryPoints()
  })

  test('getUserOperation', async () => {
    const hash = await bundlerClient.sendUserOperation({
      account,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      maxFeePerGas: 1000000000n,
      maxPriorityFeePerGas: 1000000000n,
    })
    await bundlerClient.request({
      method: 'debug_bundler_sendBundleNow',
    })
    await mine(client, { blocks: 1 })
    await bundlerClient.getUserOperation({ hash })
  })

  test('getUserOperationReceipt', async () => {
    const hash = await bundlerClient.sendUserOperation({
      account,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      maxFeePerGas: 1000000000n,
      maxPriorityFeePerGas: 1000000000n,
    })
    await bundlerClient.request({
      method: 'debug_bundler_sendBundleNow',
    })
    await mine(client, { blocks: 1 })
    await bundlerClient.getUserOperationReceipt({ hash })
  })

  test('prepareUserOperation', async () => {
    await bundlerClient.prepareUserOperation({
      account,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      maxFeePerGas: 1000000000n,
      maxPriorityFeePerGas: 1000000000n,
    })
  })

  test('sendUserOperation', async () => {
    await bundlerClient.sendUserOperation({
      account,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      maxFeePerGas: 1000000000n,
      maxPriorityFeePerGas: 1000000000n,
    })
    await bundlerClient.request({
      method: 'debug_bundler_sendBundleNow',
    })
    await mine(client, {
      blocks: 1,
    })
  })

  test('waitForUserOperationReceipt', async () => {
    const hash = await bundlerClient.sendUserOperation({
      account,
      calls: [
        {
          to: '0x0000000000000000000000000000000000000000',
          value: 0n,
        },
      ],
      maxFeePerGas: 1000000000n,
      maxPriorityFeePerGas: 1000000000n,
    })

    const [receipt] = await Promise.all([
      bundlerClient.waitForUserOperationReceipt({
        hash,
      }),
      (async () => {
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
