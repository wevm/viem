import { beforeAll, beforeEach, describe, expect, test } from 'vitest'
import {
  getSmartAccounts_06,
  getSmartAccounts_07,
  getSmartAccounts_08,
} from '../../../../test/src/account-abstraction.js'
import { anvilMainnet } from '../../../../test/src/anvil.js'
import { bundlerMainnet } from '../../../../test/src/bundler.js'
import { getTransactionCount, mine, reset } from '../../../actions/index.js'
import { parseEther, parseGwei } from '../../../utils/index.js'
import { getUserOperationReceipt } from './getUserOperationReceipt.js'
import { sendUserOperation } from './sendUserOperation.js'

const client = anvilMainnet.getClient({ account: true })
const bundlerClient = bundlerMainnet.getBundlerClient()

const fees = {
  maxFeePerGas: parseGwei('7'),
  maxPriorityFeePerGas: parseGwei('1'),
} as const

beforeEach(async () => {
  await bundlerMainnet.restart()
})

describe('entryPointVersion: 0.8', async () => {
  let account: Awaited<
    ReturnType<typeof getSmartAccounts_08>
  >[0]['smartAccount']
  let owner: Awaited<ReturnType<typeof getSmartAccounts_08>>[0]['owner']
  beforeAll(async () => {
    await reset(client, {
      blockNumber: 22239294n,
      jsonRpcUrl: anvilMainnet.forkUrl,
    })

    // Get smart accounts after reset is complete
    const accounts = await getSmartAccounts_08()
    account = accounts[0].smartAccount
    owner = accounts[0].owner
  })

  test('default', async () => {
    const authorization = await owner.signAuthorization({
      address: account.implementation,
      chainId: client.chain.id,
      nonce: await getTransactionCount(client, {
        address: owner.address,
      }),
    })

    const hash = await sendUserOperation(bundlerClient, {
      account,
      calls: [
        {
          to: '0x0000000000000000000000000000000000000000',
          value: parseEther('1'),
        },
      ],
      authorization,
      ...fees,
    })

    await bundlerClient.request({
      method: 'debug_bundler_sendBundleNow',
    })
    await mine(client, {
      blocks: 1,
    })

    const receipt = await getUserOperationReceipt(bundlerClient, {
      hash,
    })

    expect(receipt.success).toBeTruthy()
  })

  test('error: receipt not found', async () => {
    const authorization = await owner.signAuthorization({
      address: account.implementation,
      chainId: client.chain.id,
      nonce: await getTransactionCount(client, {
        address: owner.address,
      }),
    })

    const hash = await sendUserOperation(bundlerClient, {
      account,
      calls: [
        {
          to: '0x0000000000000000000000000000000000000000',
          value: parseEther('1'),
        },
      ],
      authorization,
      ...fees,
    })

    await expect(() =>
      getUserOperationReceipt(bundlerClient, {
        hash,
      }),
    ).rejects.toThrowError(
      'The User Operation may not have been processed yet.',
    )
  })
})

describe('entryPointVersion: 0.7', async () => {
  let account: Awaited<ReturnType<typeof getSmartAccounts_07>>[0]
  beforeAll(async () => {
    await reset(client, {
      blockNumber: 22239294n,
      jsonRpcUrl: anvilMainnet.forkUrl,
    })

    // Get smart accounts after reset is complete
    const accounts = await getSmartAccounts_07()
    account = accounts[0]
  })

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

    await bundlerClient.request({
      method: 'debug_bundler_sendBundleNow',
    })
    await mine(client, {
      blocks: 1,
    })

    const receipt = await getUserOperationReceipt(bundlerClient, {
      hash,
    })

    expect(receipt.success).toBeTruthy()
  })

  test('error: receipt not found', async () => {
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
      getUserOperationReceipt(bundlerClient, {
        hash,
      }),
    ).rejects.toThrowError(
      'The User Operation may not have been processed yet.',
    )
  })
})

describe('entryPointVersion: 0.6', async () => {
  let account: Awaited<ReturnType<typeof getSmartAccounts_06>>[0]
  beforeAll(async () => {
    await reset(client, {
      blockNumber: 22239294n,
      jsonRpcUrl: anvilMainnet.forkUrl,
    })

    // Get smart accounts after reset is complete
    const accounts = await getSmartAccounts_06()
    account = accounts[0]
  })

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

    await bundlerClient.request({
      method: 'debug_bundler_sendBundleNow',
    })
    await mine(client, {
      blocks: 1,
    })

    const receipt = await getUserOperationReceipt(bundlerClient, {
      hash,
    })

    expect(receipt.success).toBeTruthy()
  })
})
