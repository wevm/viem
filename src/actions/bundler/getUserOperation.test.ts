import { beforeEach, describe, expect, test } from 'vitest'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { bundlerMainnet } from '../../../test/src/bundler.js'
import {
  getSmartAccounts_06,
  getSmartAccounts_07,
} from '../../../test/src/smartAccounts.js'
import { parseEther, parseGwei, stringify } from '../../utils/index.js'
import { mine } from '../test/mine.js'
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

    expect(
      JSON.parse(
        stringify(result, (key, value) => {
          if (key === 'blockHash') return '...'
          return value
        }),
      ),
    ).toMatchInlineSnapshot(`
      {
        "blockHash": "...",
        "blockNumber": "19868027",
        "entryPoint": "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
        "transactionHash": "0xda3eac6a02829cb62d4fe85bd7a7edd58f028ae9926755b3241c169d921c87f5",
        "userOperation": {
          "callData": "0xb61d27f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
          "callGasLimit": "80000",
          "factory": "0xfb6dAB6200b8958C2655C3747708F82243d3F32E",
          "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
          "maxFeePerGas": "7000000000",
          "maxPriorityFeePerGas": "1000000000",
          "nonce": "0",
          "paymaster": null,
          "paymasterData": null,
          "paymasterPostOpGasLimit": null,
          "paymasterVerificationGasLimit": null,
          "preVerificationGas": "51722",
          "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
          "signature": "0x397c0ace53d50072fb24d83c74838d8afc2deea50f5414a9aa3fa5f23e516c513363aeb23357c6190bdc9fce8dfed772551ef0cdc65d5811c6c4cf84d14eab401b",
          "verificationGasLimit": "259060",
        },
      }
    `)
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
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationNotFoundError: User Operation with hash "0x71188c6207d26b66e5bd03e05b04196b963ad26ec6ce91d234aef3af607cddf7" could not be found.

      Version: viem@x.y.z]
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

    await bundlerClient.request({
      method: 'debug_bundler_sendBundleNow',
    })
    await mine(client, {
      blocks: 1,
    })

    const result = await getUserOperation(bundlerClient, {
      hash,
    })

    expect(
      JSON.parse(
        stringify(result, (key, value) => {
          if (key === 'blockHash') return '...'
          return value
        }),
      ),
    ).toMatchInlineSnapshot(`
      {
        "blockHash": "...",
        "blockNumber": "19868028",
        "entryPoint": "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
        "transactionHash": "0x2e14cbbe0c9df03d07fbfe6390497942d4595dc4f581d7c55d9f5708452cfdd5",
        "userOperation": {
          "callData": "0xb61d27f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
          "callGasLimit": "80000",
          "initCode": "0xabebe9a2d62af9a89e86eb208b51321e748640c3f14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
          "maxFeePerGas": "7000000000",
          "maxPriorityFeePerGas": "1000000000",
          "nonce": "0",
          "paymasterAndData": "0x",
          "preVerificationGas": "55233",
          "sender": "0x6edf7db791fC4D438D4A683E857B2fE1a84947Ce",
          "signature": "0x7f40f4e07b9e120e472543786d3241948871c29f15ca0425114e1abe6f0d4cc03f095927fbfd2640a77a044e7a771f724770a65da8dd8ff39132fcc0447459a51b",
          "verificationGasLimit": "258801",
        },
      }
    `)
  })
})
