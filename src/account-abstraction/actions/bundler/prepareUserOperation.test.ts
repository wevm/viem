import { beforeEach, describe, expect, test, vi } from 'vitest'
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

  vi.useFakeTimers()
  vi.setSystemTime(new Date(Date.UTC(2023, 1, 1)))
  return () => vi.useRealTimers()
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
        "nonce": 30902162761021348478818713600000n,
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
        "nonce": 30902162761039795222892423151616n,
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
        "nonce": 30902162761058241966966132703232n,
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
        "nonce": 30902162761095135455113551806464n,
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
        "nonce": 30902162761113582199187261358080n,
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
        "nonce": 30902162761132028943260970909696n,
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
        "nonce": 30902162761187369175482099564544n,
        "paymaster": "0xf42ec71a4440f5e9871c643696dd6dc9a38911f8",
        "paymasterData": "0x00000000000000000000000000000000000000000000000000000000deadbeef0000000000000000000000000000000000000000000000000000000000001234c6b3c2eae05243d400394621384296c3877c11cc3b46217e8b3f94a80422fc1c283bd78df37c33f5631f9b3731201a4937b1bbb3eed63a2012293d5034ab5c311c",
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "preVerificationGas": 59826n,
        "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        "verificationGasLimit": 237672n,
      }
    `)
  })

  test('args: paymaster (client w/ no chain)', async () => {
    const client = anvilMainnet.getClient({ account: true, chain: false })

    const paymaster = await getVerifyingPaymaster_07()
    const server = await createVerifyingPaymasterServer(client, { paymaster })

    const paymasterClient = createPaymasterClient({
      transport: http(server.url),
    })

    const bundlerClient = bundlerMainnet.getBundlerClient({
      client,
      chain: false,
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

    expect(request).toBeDefined()
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
        "nonce": 30902162761224262663629518667776n,
        "paymaster": "0xd73bab8f06db28c87932571f87d0d2c0fdf13d94",
        "paymasterData": "0x00000000000000000000000000000000000000000000000000000000deadbeef00000000000000000000000000000000000000000000000000000000000012341e5985f083100db494f0ae065203ca5a8622705b1694177106748ac46669ba13189811d274738892c4c8dc9b2d5ba838c3e96f80af0c2d1bc4c4d100323822791c",
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
        "nonce": 30902162761242709407703228219392n,
        "paymaster": "0x28227b230d3945e580ed3b1c6c8ea1df658a7aa9",
        "paymasterData": "0x00000000000000000000000000000000000000000000000000000000deadbeef00000000000000000000000000000000000000000000000000000000000012344ed861882e796d9e2b6c83120defdf4d5a328f1efd0905d9a099ed68fe7b78f743627e3222882dacbf3d5120addf3f4a36160c6a1a8cb4ec4dcffee3a65d1f631b",
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
        "nonce": 30902162761261156151776937771008n,
        "paymaster": "0x82a9286db983093ff234cefcea1d8fa66382876b",
        "paymasterData": "0x00000000000000000000000000000000000000000000000000000000deadbf1800000000000000000000000000000000000000000000000000000000000012341c201216c41d0f4f25d9fa5f59bd67de22382a97c372ee9e89f1a884f627b8240f251c72d3442d2e24c0f5dc231ec633134fd071daaafe922b13b33a3429fbea1c",
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "preVerificationGas": 59826n,
        "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        "verificationGasLimit": 237672n,
      }
    `)
  })

  test('args: signature', async () => {
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
      signature: '0xdeadbeef',
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
        "nonce": 30902162761279602895850647322624n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 51246n,
        "sender": "0xE911628bF8428C23f179a07b081325cAe376DE1f",
        "signature": "0xdeadbeef",
        "verificationGasLimit": 254502n,
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
        "nonce": 30902162761298049639924356874240n,
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
        "nonce": 30902162761316496383998066425856n,
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
        "nonce": 30902162761353389872145485529088n,
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
        "nonce": 30902162761390283360292904632320n,
        "paymaster": "0x41219a0a9c0b86ed81933c788a6b63dfef8f17ee",
        "paymasterData": "0x00000000000000000000000000000000000000000000000000000000deadbeef0000000000000000000000000000000000000000000000000000000000001234fc6dca78f243df7d59c299a92b566ac102011e79a5a72c21921be882d1d42bd10b8bd6cb743fe39c2bca82fac658a474fb273f1eeb2e4dbf056e62877b87fe7b1b",
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
        "nonce": 30902162761408730104366614183936n,
        "paymaster": "0x1d460d731bd5a0ff2ca07309daeb8641a7b175a1",
        "paymasterData": "0x00000000000000000000000000000000000000000000000000000000deadbeef0000000000000000000000000000000000000000000000000000000000001234382583762a2f2d8c5d57aab2ec3c7a899190e43c06114cab15b103da3e076c0330dcf7d93cc5cfdd95be5b81c3724d56576637c370f8a686591cfedffff3e06f1b",
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
        "nonce": 30902162761427176848440323735552n,
        "paymaster": "0xf67e26649037695ddfab19f4e22d5c9fd1564592",
        "paymasterData": "0x00000000000000000000000000000000000000000000000000000000deadbeef000000000000000000000000000000000000000000000000000000000000123481cad233167ea1d8ed383d4a460c9f9ea3853d8de80f3bbae3f7532c0bc3cd707ebf52eefb227b068f3c14dbf113cbbba5b3ff893d9bbeef622557f52fe2496e1b",
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
        "nonce": 30902162761445623592514033287168n,
        "paymaster": "0xea8ae08513f8230caa8d031d28cb4ac8ce720c68",
        "paymasterData": "0x00000000000000000000000000000000000000000000000000000000deadbf18000000000000000000000000000000000000000000000000000000000000123473e52a4667dd3ef6df23825f569d0902f5961bf96056008fd91d41513ef8eee467fffc20a829c697d364c1063c2b249fa87ea14430c89638052ce217a3ae34841b",
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
        "nonce": 30902162761021348478818713600000n,
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
        "nonce": 30902162761039795222892423151616n,
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
