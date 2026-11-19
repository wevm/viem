import { beforeEach, describe, expect, test } from 'vitest'
import {
  getSmartAccounts_06,
  getSmartAccounts_07,
  getSmartAccounts_08,
} from '~test/account-abstraction.js'
import { anvilMainnet } from '~test/anvil.js'
import { bundlerMainnet } from '~test/bundler.js'
import { createHttpServer } from '~test/utils.js'
import { signAuthorization } from '../../../actions/index.js'
import { mine } from '../../../actions/test/mine.js'
import { http } from '../../../clients/transports/http.js'
import { parseEther, parseGwei } from '../../../utils/index.js'
import { createBundlerClient } from '../../clients/createBundlerClient.js'
import { getUserOperation } from './getUserOperation.js'
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

test('behavior: pending user operation', async () => {
  const server = await createHttpServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        result: {
          blockHash: null,
          blockNumber: null,
          entryPoint: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
          transactionHash: null,
          userOperation: {
            callData: '0xdeadbeef',
            callGasLimit: '0x1a1c0',
            maxFeePerGas: '0x1a13b8600',
            maxPriorityFeePerGas: '0x3b9aca00',
            nonce: '0x0',
            preVerificationGas: '0xb1f4',
            sender: '0x0000000000000000000000000000000000000001',
            signature: '0xcafebabe',
            verificationGasLimit: '0x18190',
          },
        },
      }),
    )
  })

  const client = createBundlerClient({ transport: http(server.url) })

  const result = await getUserOperation(client, {
    hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
  })

  expect(result).toMatchInlineSnapshot(`
    {
      "blockHash": null,
      "blockNumber": null,
      "entryPoint": "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
      "transactionHash": null,
      "userOperation": {
        "callData": "0xdeadbeef",
        "callGasLimit": 106944n,
        "maxFeePerGas": 7000000000n,
        "maxPriorityFeePerGas": 1000000000n,
        "nonce": 0n,
        "preVerificationGas": 45556n,
        "sender": "0x0000000000000000000000000000000000000001",
        "signature": "0xcafebabe",
        "verificationGasLimit": 98704n,
      },
    }
  `)

  await server.close()
})

describe('entryPointVersion: 0.8', async () => {
  const [account] = await getSmartAccounts_08()

  test('default', async () => {
    const authorization = await signAuthorization(
      account.client,
      account.authorization,
    )
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

    const result = await getUserOperation(bundlerClient, {
      hash,
    })

    expect(result).toBeDefined()
  })

  test('error: user operation not found', async () => {
    const authorization = await signAuthorization(client, account.authorization)
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
      getUserOperation(bundlerClient, {
        hash,
      }),
    ).rejects.toThrow('User Operation with hash')
  })
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

    await bundlerClient.request({
      method: 'debug_bundler_sendBundleNow',
    })
    await mine(client, {
      blocks: 1,
    })

    const result = await getUserOperation(bundlerClient, {
      hash,
    })

    expect(result).toBeDefined()
  })

  test('error: user operation not found', async () => {
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
      getUserOperation(bundlerClient, {
        hash,
      }),
    ).rejects.toThrow('User Operation with hash')
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

    await bundlerClient.request({
      method: 'debug_bundler_sendBundleNow',
    })
    await mine(client, {
      blocks: 1,
    })

    const result = await getUserOperation(bundlerClient, {
      hash,
    })

    expect(result).toBeDefined()
  })
})
