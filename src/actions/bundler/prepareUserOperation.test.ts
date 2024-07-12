import { describe, expect, test } from 'vitest'
import { wagmiContractConfig } from '../../../test/src/abis.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { bundlerMainnet } from '../../../test/src/bundler.js'
import {
  getSmartAccounts_06,
  getSmartAccounts_07,
} from '../../../test/src/smartAccounts.js'
import { parseEther } from '../../utils/index.js'
import { prepareUserOperation } from './prepareUserOperation.js'

const client = anvilMainnet.getClient()
const bundlerClient = bundlerMainnet.getBundlerClient({ client })

describe('entryPointVersion: 0.7', async () => {
  const [account] = await getSmartAccounts_07()

  test('default', async () => {
    const request = await prepareUserOperation(bundlerClient, {
      account,
      calls: [
        {
          to: '0x0000000000000000000000000000000000000000',
          value: parseEther('1'),
        },
        {
          to: wagmiContractConfig.address,
          abi: wagmiContractConfig.abi,
          functionName: 'mint',
        },
      ],
    })

    expect({ ...request, account: undefined }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 141653n,
        "factory": "0xfb6dab6200b8958c2655c3747708f82243d3f32e",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": 12981960176n,
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 0n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 53438n,
        "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
        "verificationGasLimit": 259350n,
      }
    `)
  })

  test('args: callData', async () => {
    const request = await prepareUserOperation(bundlerClient, {
      account,
      callData:
        '0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
    })

    expect({ ...request, account: undefined }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 80000n,
        "factory": "0xfb6dab6200b8958c2655c3747708f82243d3f32e",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": 12981960176n,
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 0n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 51642n,
        "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
        "verificationGasLimit": 259060n,
      }
    `)
  })

  test('args: parameters (no factory)', async () => {
    const request = await prepareUserOperation(bundlerClient, {
      account,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      parameters: ['gas', 'nonce'],
    })

    expect({ ...request, account: undefined }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 80000n,
        "nonce": 0n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 51642n,
        "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
        "verificationGasLimit": 259060n,
      }
    `)
  })

  test('args: parameters (no nonce)', async () => {
    const request = await prepareUserOperation(bundlerClient, {
      account,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      parameters: ['gas', 'factory'],
    })

    expect({ ...request, account: undefined }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 80000n,
        "factory": "0xfb6dab6200b8958c2655c3747708f82243d3f32e",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 51642n,
        "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
        "verificationGasLimit": 259060n,
      }
    `)
  })

  test('args: nonce', async () => {
    const request = await prepareUserOperation(bundlerClient, {
      account,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      nonce: 0n,
    })

    expect({ ...request, account: undefined }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 80000n,
        "factory": "0xfb6dab6200b8958c2655c3747708f82243d3f32e",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": 12981960176n,
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 0n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 51642n,
        "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
        "verificationGasLimit": 259060n,
      }
    `)
  })

  test('args: fees', async () => {
    const request = await prepareUserOperation(bundlerClient, {
      account,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      maxFeePerGas: 2n,
      maxPriorityFeePerGas: 1n,
    })

    expect({ ...request, account: undefined }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 80000n,
        "factory": "0xfb6dab6200b8958c2655c3747708f82243d3f32e",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": 2n,
        "maxPriorityFeePerGas": 1n,
        "nonce": 0n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 51642n,
        "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
        "verificationGasLimit": 259060n,
      }
    `)

    const request_2 = await prepareUserOperation(bundlerClient, {
      account,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      maxFeePerGas: 2n,
    })

    expect({ ...request_2, account: undefined }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 80000n,
        "factory": "0xfb6dab6200b8958c2655c3747708f82243d3f32e",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": 2n,
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 0n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 51642n,
        "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
        "verificationGasLimit": 259060n,
      }
    `)

    const request_3 = await prepareUserOperation(bundlerClient, {
      account,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      maxPriorityFeePerGas: 2n,
    })

    expect({ ...request_3, account: undefined }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 80000n,
        "factory": "0xfb6dab6200b8958c2655c3747708f82243d3f32e",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": 12981960176n,
        "maxPriorityFeePerGas": 2n,
        "nonce": 0n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 51642n,
        "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
        "verificationGasLimit": 259060n,
      }
    `)
  })

  test('error: no account', async () => {
    await expect(() =>
      // @ts-expect-error
      prepareUserOperation(bundlerClient, {
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [AccountNotFoundError: Could not find an Account to execute with this Action.
      Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the Client.

      Version: viem@x.y.z]
    `)
  })
})

describe('entryPointVersion: 0.6', async () => {
  const [account] = await getSmartAccounts_06()

  test('default', async () => {
    const request = await prepareUserOperation(bundlerClient, {
      account,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
    })
    expect({ ...request, account: undefined }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 80000n,
        "initCode": "0xabebe9a2d62af9a89e86eb208b51321e748640c3f14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": 12981960176n,
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 0n,
        "paymasterAndData": "0x",
        "preVerificationGas": 55154n,
        "sender": "0x6edf7db791fC4D438D4A683E857B2fE1a84947Ce",
        "verificationGasLimit": 258801n,
      }
    `)
  })

  test('args: parameters (no factory)', async () => {
    const request = await prepareUserOperation(bundlerClient, {
      account,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      parameters: ['gas', 'nonce'],
    })
    expect({ ...request, account: undefined }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 80000n,
        "nonce": 0n,
        "paymasterAndData": "0x",
        "preVerificationGas": 55154n,
        "sender": "0x6edf7db791fC4D438D4A683E857B2fE1a84947Ce",
        "verificationGasLimit": 258801n,
      }
    `)
  })
})
