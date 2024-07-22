import { beforeEach, describe, expect, test } from 'vitest'
import { wagmiContractConfig } from '../../../../test/src/abis.js'
import {
  createVerifyingPaymasterServer,
  getSmartAccounts_06,
  getSmartAccounts_07,
  getVerifyingPaymaster_07,
} from '../../../../test/src/account-abstraction.js'
import { anvilMainnet } from '../../../../test/src/anvil.js'
import { bundlerMainnet } from '../../../../test/src/bundler.js'
import { accounts } from '../../../../test/src/constants.js'
import { mine } from '../../../actions/test/mine.js'
import { writeContract } from '../../../actions/wallet/writeContract.js'
import { http } from '../../../clients/transports/http.js'
import { pad, parseEther, parseGwei } from '../../../utils/index.js'
import { createPaymasterClient } from '../../clients/createPaymasterClient.js'
import { getPaymasterData } from '../paymaster/getPaymasterData.js'
import { getPaymasterStubData } from '../paymaster/getPaymasterStubData.js'
import { prepareUserOperation } from './prepareUserOperation.js'

const client = anvilMainnet.getClient({ account: true })
const bundlerClient = bundlerMainnet.getBundlerClient({ client })

const fees = {
  maxFeePerGas: parseGwei('15'),
  maxPriorityFeePerGas: parseGwei('2'),
} as const

beforeEach(async () => {
  await bundlerMainnet.restart()
})

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
      ...fees,
    })

    expect({
      ...request,
      maxFeePerGas: undefined,
      account: undefined,
    }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 141653n,
        "factory": "0xfb6dab6200b8958c2655c3747708f82243d3f32e",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": undefined,
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 0n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 53438n,
        "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        "verificationGasLimit": 259350n,
      }
    `)
  })

  test('args: callData', async () => {
    const request = await prepareUserOperation(bundlerClient, {
      account,
      callData:
        '0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
      ...fees,
    })

    expect({
      ...request,
      maxFeePerGas: undefined,
      account: undefined,
    }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 80000n,
        "factory": "0xfb6dab6200b8958c2655c3747708f82243d3f32e",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": undefined,
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 0n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 51642n,
        "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        "verificationGasLimit": 259060n,
      }
    `)
  })

  test('args: parameters (no factory)', async () => {
    const request = await prepareUserOperation(bundlerClient, {
      account,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      parameters: ['gas', 'nonce'],
      ...fees,
    })

    expect({ ...request, account: undefined }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 80000n,
        "maxFeePerGas": 15000000000n,
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

  test('args: parameters (no nonce)', async () => {
    const request = await prepareUserOperation(bundlerClient, {
      account,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      parameters: ['gas', 'factory'],
      ...fees,
    })

    expect({ ...request, account: undefined }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 80000n,
        "factory": "0xfb6dab6200b8958c2655c3747708f82243d3f32e",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
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
      ...fees,
    })

    expect({
      ...request,
      maxFeePerGas: undefined,
      account: undefined,
    }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 80000n,
        "factory": "0xfb6dab6200b8958c2655c3747708f82243d3f32e",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": undefined,
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 0n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 51642n,
        "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
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
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
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
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        "verificationGasLimit": 259060n,
      }
    `)

    const request_3 = await prepareUserOperation(bundlerClient, {
      account,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      maxPriorityFeePerGas: 2n,
    })

    expect({
      ...request_3,
      maxFeePerGas: undefined,
      account: undefined,
    }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 80000n,
        "factory": "0xfb6dab6200b8958c2655c3747708f82243d3f32e",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": undefined,
        "maxPriorityFeePerGas": 2n,
        "nonce": 0n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 51642n,
        "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        "verificationGasLimit": 259060n,
      }
    `)
  })

  test('args: paymaster (address)', async () => {
    await expect(() =>
      prepareUserOperation(bundlerClient, {
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
        paymaster: '0x0000000000000000000000000000000000000000',
        ...fees,
      }),
    ).rejects.toThrowError()
  })

  test('args: paymaster (true)', async () => {
    await expect(() =>
      prepareUserOperation(bundlerClient, {
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
        paymaster: true,
        ...fees,
      }),
    ).rejects.toThrowError()
  })

  test('args: paymaster (client)', async () => {
    const paymaster = await getVerifyingPaymaster_07()
    const server = await createVerifyingPaymasterServer(client, { paymaster })

    const paymasterClient = createPaymasterClient({
      transport: http(server.url),
    })

    const bundlerClient = bundlerMainnet.getBundlerClient({
      client,
    })

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
      paymaster: paymasterClient,
      ...fees,
    })

    expect({
      ...request,
      account: undefined,
    }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 141653n,
        "factory": "0xfb6dab6200b8958c2655c3747708f82243d3f32e",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 0n,
        "paymaster": "0xf42ec71a4440f5e9871c643696dd6dc9a38911f8",
        "paymasterData": "0x00000000000000000000000000000000000000000000000000000000deadbeef0000000000000000000000000000000000000000000000000000000000001234f4e65f4b5c80b1186da75059709ec2f2c2dc8ab2f0499771090ca1cef62bebc45def7376c49de7fc1cc97ff77693b56a4276a38dcbda802074cd3b1166675c6e1b",
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "preVerificationGas": 59826n,
        "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        "verificationGasLimit": 237672n,
      }
    `)
  })

  test('args: paymaster.getPaymasterData', async () => {
    const paymaster = await getVerifyingPaymaster_07()
    const server = await createVerifyingPaymasterServer(client, { paymaster })

    const paymasterClient = createPaymasterClient({
      transport: http(server.url),
    })

    const bundlerClient = bundlerMainnet.getBundlerClient({
      client,
    })

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
      paymaster: {
        async getPaymasterData(parameters) {
          return getPaymasterData(paymasterClient, parameters)
        },
      },
      ...fees,
    })

    expect({
      ...request,
      account: undefined,
    }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 141653n,
        "factory": "0xfb6dab6200b8958c2655c3747708f82243d3f32e",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 0n,
        "paymaster": "0xbc71f5687cfd36f64ae6b4549186ee3a6ee259a4",
        "paymasterData": "0x00000000000000000000000000000000000000000000000000000000deadbeef0000000000000000000000000000000000000000000000000000000000001234a3ac0d56d70383281dd6cd387dfbfd2d720809d6358165d81f9a7589ff6b5dd9108bd313a882027a7ef56b60d0de652163a1377ae394cf0efe563c1d93b1d8121b",
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "preVerificationGas": 59826n,
        "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        "verificationGasLimit": 237672n,
      }
    `)
  })

  test('args: paymaster.getPaymasterStubData + paymaster.getPaymasterData', async () => {
    const paymaster = await getVerifyingPaymaster_07()
    const server = await createVerifyingPaymasterServer(client, { paymaster })

    const paymasterClient = createPaymasterClient({
      transport: http(server.url),
    })

    const bundlerClient = bundlerMainnet.getBundlerClient({
      client,
    })

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
      paymaster: {
        async getPaymasterStubData(parameters) {
          return getPaymasterStubData(paymasterClient, parameters)
        },
        async getPaymasterData(parameters) {
          return getPaymasterData(paymasterClient, parameters)
        },
      },
      ...fees,
    })

    expect({
      ...request,
      account: undefined,
    }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 141653n,
        "factory": "0xfb6dab6200b8958c2655c3747708f82243d3f32e",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 0n,
        "paymaster": "0xd73bab8f06db28c87932571f87d0d2c0fdf13d94",
        "paymasterData": "0x00000000000000000000000000000000000000000000000000000000deadbeef0000000000000000000000000000000000000000000000000000000000001234fa687a4c3bcca5e3a2530cf206875d6418e00749513c3cae56ac53e6a2d81ce66b58aa94fec342e798f05f3480a2e336fd2c2d2f7efcbafbd539e132f8efc2581c",
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "preVerificationGas": 59826n,
        "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        "verificationGasLimit": 237672n,
      }
    `)
  })

  test('args: paymasterContext', async () => {
    const paymaster = await getVerifyingPaymaster_07()
    const server = await createVerifyingPaymasterServer(client, { paymaster })

    const paymasterClient = createPaymasterClient({
      transport: http(server.url),
    })

    const bundlerClient = bundlerMainnet.getBundlerClient({
      client,
    })

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
      paymaster: paymasterClient,
      paymasterContext: { validUntil: 3735928600 },
      ...fees,
    })

    expect({
      ...request,
      account: undefined,
    }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 141653n,
        "factory": "0xfb6dab6200b8958c2655c3747708f82243d3f32e",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 0n,
        "paymaster": "0x28227b230d3945e580ed3b1c6c8ea1df658a7aa9",
        "paymasterData": "0x00000000000000000000000000000000000000000000000000000000deadbf1800000000000000000000000000000000000000000000000000000000000012349e011e8797c6630029b2a61a644a802926c6252770cb452ecab510d3570d586c116313fd95eaf84b8512a6603013fba467101f807f13670820eaf636fbf3e4101b",
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "preVerificationGas": 59826n,
        "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        "verificationGasLimit": 237672n,
      }
    `)
  })

  test('behavior: account.userOperation.estimateGas', async () => {
    const request = await prepareUserOperation(bundlerClient, {
      account: {
        ...account,
        userOperation: {
          async estimateGas() {
            return { verificationGasLimit: 1_000_000n }
          },
        },
      },
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
      ...fees,
    })

    expect({
      ...request,
      account: undefined,
    }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 141653n,
        "factory": "0xfb6dab6200b8958c2655c3747708f82243d3f32e",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 0n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 53438n,
        "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        "verificationGasLimit": 1000000n,
      }
    `)
  })

  test('behavior: account.userOperation.estimateGas (all filled)', async () => {
    const request = await prepareUserOperation(bundlerClient, {
      account: {
        ...account,
        userOperation: {
          async estimateGas() {
            return {
              callGasLimit: 1_000_000n,
              preVerificationGas: 1_000_000n,
              verificationGasLimit: 1_000_000n,
            }
          },
        },
      },
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
      ...fees,
    })

    expect({
      ...request,
      account: undefined,
    }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 1000000n,
        "factory": "0xfb6dab6200b8958c2655c3747708f82243d3f32e",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 0n,
        "preVerificationGas": 1000000n,
        "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        "verificationGasLimit": 1000000n,
      }
    `)
  })

  test('behavior: account.userOperation.estimateGas (all filled – paymaster)', async () => {
    await prepareUserOperation(bundlerClient, {
      account: {
        ...account,
        userOperation: {
          async estimateGas() {
            return {
              callGasLimit: 1_000_000n,
              preVerificationGas: 1_000_000n,
              verificationGasLimit: 1_000_000n,
              paymasterPostOpGasLimit: 1_000_000n,
              paymasterVerificationGasLimit: 1_000_000n,
            }
          },
        },
      },
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
      paymaster: '0x0000000000000000000000000000000000000000',
      ...fees,
    })
  })

  test('behavior: client.userOperation.estimateFeesPerGas', async () => {
    const bundlerClient = bundlerMainnet.getBundlerClient({
      client,
      userOperation: {
        async estimateFeesPerGas() {
          return { maxFeePerGas: 3_000_000n, maxPriorityFeePerGas: 1_000_000n }
        },
      },
    })

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
      ...fees,
    })

    expect({
      ...request,
      account: undefined,
    }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 141653n,
        "factory": "0xfb6dab6200b8958c2655c3747708f82243d3f32e",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": 3000000n,
        "maxPriorityFeePerGas": 1000000n,
        "nonce": 0n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 53438n,
        "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        "verificationGasLimit": 259350n,
      }
    `)
  })

  test('behavior: bundlerClient.paymaster', async () => {
    const bundlerClient = bundlerMainnet.getBundlerClient({
      client,
      paymaster: true,
    })

    await expect(() =>
      prepareUserOperation(bundlerClient, {
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
        ...fees,
      }),
    ).rejects.toThrowError()
  })

  test('behavior: bundlerClient.paymaster (client)', async () => {
    const paymaster = await getVerifyingPaymaster_07()
    const server = await createVerifyingPaymasterServer(client, { paymaster })

    const paymasterClient = createPaymasterClient({
      transport: http(server.url),
    })

    const bundlerClient = bundlerMainnet.getBundlerClient({
      client,
      paymaster: paymasterClient,
    })

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
      ...fees,
    })

    expect({
      ...request,
      account: undefined,
    }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 141653n,
        "factory": "0xfb6dab6200b8958c2655c3747708f82243d3f32e",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 0n,
        "paymaster": "0x82a9286db983093ff234cefcea1d8fa66382876b",
        "paymasterData": "0x00000000000000000000000000000000000000000000000000000000deadbeef00000000000000000000000000000000000000000000000000000000000012347470bc5536d3b205b3dd3395c5a459c0ba21fbfb45ce81db748def649ca7ea6c0eb4e4ac9ff2ae86c3d37887d59c1d06972422ecb5c6be7ccf739f3c4c6dccb51c",
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "preVerificationGas": 59826n,
        "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        "verificationGasLimit": 237672n,
      }
    `)
  })

  test('behavior: client.paymaster.getPaymasterData', async () => {
    const paymaster = await getVerifyingPaymaster_07()
    const server = await createVerifyingPaymasterServer(client, { paymaster })

    const paymasterClient = createPaymasterClient({
      transport: http(server.url),
    })

    const bundlerClient = bundlerMainnet.getBundlerClient({
      client,
      paymaster: {
        async getPaymasterData(parameters) {
          return getPaymasterData(paymasterClient, parameters)
        },
      },
    })

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
      ...fees,
    })

    expect({
      ...request,
      account: undefined,
    }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 141653n,
        "factory": "0xfb6dab6200b8958c2655c3747708f82243d3f32e",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 0n,
        "paymaster": "0x41219a0a9c0b86ed81933c788a6b63dfef8f17ee",
        "paymasterData": "0x00000000000000000000000000000000000000000000000000000000deadbeef00000000000000000000000000000000000000000000000000000000000012343306bde20aba7a1f2b13db630be29a1d25a7ab708b100c80593c51308d2cd66a05d66e7ff235d3df03ee8c0c31f2b2d3ade09007c1945abccaf93d0e3baa3f991c",
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "preVerificationGas": 59826n,
        "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        "verificationGasLimit": 237672n,
      }
    `)
  })

  test('behavior: client.paymaster.getPaymasterStubData + client.paymaster.getPaymasterData', async () => {
    const paymaster = await getVerifyingPaymaster_07()
    const server = await createVerifyingPaymasterServer(client, { paymaster })

    const paymasterClient = createPaymasterClient({
      transport: http(server.url),
    })

    const bundlerClient = bundlerMainnet.getBundlerClient({
      client,
      paymaster: {
        async getPaymasterStubData(parameters) {
          return getPaymasterStubData(paymasterClient, parameters)
        },
        async getPaymasterData(parameters) {
          return getPaymasterData(paymasterClient, parameters)
        },
      },
    })

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
      ...fees,
    })

    expect({
      ...request,
      account: undefined,
    }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 141653n,
        "factory": "0xfb6dab6200b8958c2655c3747708f82243d3f32e",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 0n,
        "paymaster": "0x1d460d731bd5a0ff2ca07309daeb8641a7b175a1",
        "paymasterData": "0x00000000000000000000000000000000000000000000000000000000deadbeef0000000000000000000000000000000000000000000000000000000000001234a1bbd4cd1636cdeda9e2ac2c14765a68350b5fb6ed2a8d70b4dc8a7e27dbd87c496b71f8c716c2d1030339da6fb89c802c5a8d6b7565852142202cdc328d88701c",
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "preVerificationGas": 59826n,
        "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        "verificationGasLimit": 237672n,
      }
    `)
  })

  test('behavior: bundlerClient.paymasterContext', async () => {
    const paymaster = await getVerifyingPaymaster_07()
    const server = await createVerifyingPaymasterServer(client, { paymaster })

    const paymasterClient = createPaymasterClient({
      transport: http(server.url),
    })

    const bundlerClient = bundlerMainnet.getBundlerClient({
      client,
      paymaster: paymasterClient,
      paymasterContext: { validUntil: 3735928600 },
    })

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
      ...fees,
    })

    expect({
      ...request,
      account: undefined,
    }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 141653n,
        "factory": "0xfb6dab6200b8958c2655c3747708f82243d3f32e",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 0n,
        "paymaster": "0xf67e26649037695ddfab19f4e22d5c9fd1564592",
        "paymasterData": "0x00000000000000000000000000000000000000000000000000000000deadbf1800000000000000000000000000000000000000000000000000000000000012340fd38bb7d239d220ec6d3b2df34a9c11802847332a5e261acb9783d1f723a7360a9817cd2555ba80199213bd592f4b42db917105d768d94594f69476c4b0d81f1b",
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "preVerificationGas": 59826n,
        "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        "verificationGasLimit": 237672n,
      }
    `)
  })

  test('error: no account', async () => {
    await expect(() =>
      // @ts-expect-error
      prepareUserOperation(bundlerClient, {
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
        ...fees,
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
      ...fees,
    })
    expect({
      ...request,
      maxFeePerGas: undefined,
      account: undefined,
    }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 80000n,
        "initCode": "0xabebe9a2d62af9a89e86eb208b51321e748640c3f14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": undefined,
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 0n,
        "paymasterAndData": "0x",
        "paymasterPostOpGasLimit": undefined,
        "paymasterVerificationGasLimit": undefined,
        "preVerificationGas": 55154n,
        "sender": "0x6edf7db791fC4D438D4A683E857B2fE1a84947Ce",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        "verificationGasLimit": 258801n,
      }
    `)
  })

  test('args: parameters (no factory)', async () => {
    await writeContract(client, {
      abi: account.factory.abi,
      address: account.factory.address,
      functionName: 'createAccount',
      args: [accounts[0].address, pad('0x0')],
    })
    await mine(client, { blocks: 1 })

    const request = await prepareUserOperation(bundlerClient, {
      account,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      parameters: ['gas', 'nonce'],
      ...fees,
    })
    expect({ ...request, account: undefined }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "callGasLimit": 80000n,
        "initCode": "0x",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 0n,
        "paymasterAndData": "0x",
        "paymasterPostOpGasLimit": undefined,
        "paymasterVerificationGasLimit": undefined,
        "preVerificationGas": 54124n,
        "sender": "0x6edf7db791fC4D438D4A683E857B2fE1a84947Ce",
        "verificationGasLimit": 113517n,
      }
    `)
  })
})
