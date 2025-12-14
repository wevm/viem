import { beforeEach, describe, expect, test, vi } from 'vitest'
import { wagmiContractConfig } from '~test/abis.js'
import {
  createVerifyingPaymasterServer,
  getSmartAccounts_06,
  getSmartAccounts_07,
  getSmartAccounts_08,
  getVerifyingPaymaster_07,
  getVerifyingPaymaster_08,
} from '~test/account-abstraction.js'
import { anvilMainnet } from '~test/anvil.js'
import { bundlerMainnet } from '~test/bundler.js'
import { accounts } from '~test/constants.js'
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

describe('entryPointVersion: 0.8', async () => {
  const [account] = await getSmartAccounts_08()

  test('default', async () => {
    const {
      account: _,
      callGasLimit,
      maxFeePerGas,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
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

    expect(callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(maxFeePerGas).toBeGreaterThanOrEqual(0n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(90000n)

    expect(request).toMatchInlineSnapshot(`
      {
        "authorization": {
          "address": "0x081f08945fd17c5470f7bcee23fb57ab1099428e",
          "chainId": 1,
          "nonce": 958,
          "r": "0xfffffffffffffffffffffffffffffff000000000000000000000000000000000",
          "s": "0x7aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "yParity": 1,
        },
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "factory": "0x7702",
        "factoryData": "0x",
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 30902162761021348478818713600000n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 93882n,
        "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
      }
    `)
  })

  test('args: callData', async () => {
    const {
      account: _,
      callGasLimit,
      maxFeePerGas,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
      account,
      callData:
        '0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
      ...fees,
    })

    expect(callGasLimit).toBeGreaterThanOrEqual(16000n)
    expect(maxFeePerGas).toBeGreaterThanOrEqual(0n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(90000n)
    expect(request).toMatchInlineSnapshot(`
      {
        "authorization": {
          "address": "0x081f08945fd17c5470f7bcee23fb57ab1099428e",
          "chainId": 1,
          "nonce": 958,
          "r": "0xfffffffffffffffffffffffffffffff000000000000000000000000000000000",
          "s": "0x7aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "yParity": 1,
        },
        "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "factory": "0x7702",
        "factoryData": "0x",
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 30902162761039795222892423151616n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 92087n,
        "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
      }
    `)
  })

  test('args: parameters (no factory)', async () => {
    const {
      account: _,
      callGasLimit,
      maxFeePerGas,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
      account,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      parameters: ['authorization', 'gas', 'nonce'],
      ...fees,
    })

    expect(callGasLimit).toBeGreaterThanOrEqual(16000n)
    expect(maxFeePerGas).toBeGreaterThanOrEqual(0n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(90000n)
    expect(request).toMatchInlineSnapshot(`
      {
        "authorization": {
          "address": "0x081f08945fd17c5470f7bcee23fb57ab1099428e",
          "chainId": 1,
          "nonce": 958,
          "r": "0xfffffffffffffffffffffffffffffff000000000000000000000000000000000",
          "s": "0x7aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "yParity": 1,
        },
        "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 30902162761058241966966132703232n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 92087n,
        "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)
  })

  test('args: parameters (no nonce)', async () => {
    const {
      account: _,
      callGasLimit,
      maxFeePerGas,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
      account,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      parameters: ['authorization', 'gas', 'factory'],
      ...fees,
    })

    expect(callGasLimit).toBeGreaterThanOrEqual(16000n)
    expect(maxFeePerGas).toBeGreaterThanOrEqual(0n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(90000n)
    expect(request).toMatchInlineSnapshot(`
      {
        "authorization": {
          "address": "0x081f08945fd17c5470f7bcee23fb57ab1099428e",
          "chainId": 1,
          "nonce": 958,
          "r": "0xfffffffffffffffffffffffffffffff000000000000000000000000000000000",
          "s": "0x7aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "yParity": 1,
        },
        "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "factory": "0x7702",
        "factoryData": "0x",
        "maxPriorityFeePerGas": 2000000000n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 92087n,
        "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      }
    `)
  })

  test('args: nonce', async () => {
    const {
      account: _,
      callGasLimit,
      maxFeePerGas,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
      account,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      nonce: 0n,
      ...fees,
    })

    expect(callGasLimit).toBeGreaterThanOrEqual(16000n)
    expect(maxFeePerGas).toBeGreaterThanOrEqual(0n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(90000n)
    expect(request).toMatchInlineSnapshot(`
      {
        "authorization": {
          "address": "0x081f08945fd17c5470f7bcee23fb57ab1099428e",
          "chainId": 1,
          "nonce": 958,
          "r": "0xfffffffffffffffffffffffffffffff000000000000000000000000000000000",
          "s": "0x7aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "yParity": 1,
        },
        "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "factory": "0x7702",
        "factoryData": "0x",
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 0n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 92087n,
        "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
      }
    `)
  })

  test('args: fees', async () => {
    {
      const {
        account: _,
        callGasLimit,
        maxFeePerGas,
        verificationGasLimit,
        ...request
      } = await prepareUserOperation(bundlerClient, {
        account,
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
        maxFeePerGas: 2n,
        maxPriorityFeePerGas: 1n,
      })

      expect(callGasLimit).toBeGreaterThanOrEqual(16000n)
      expect(maxFeePerGas).toBeGreaterThanOrEqual(0n)
      expect(verificationGasLimit).toBeGreaterThanOrEqual(90000n)
      expect(request).toMatchInlineSnapshot(`
        {
          "authorization": {
            "address": "0x081f08945fd17c5470f7bcee23fb57ab1099428e",
            "chainId": 1,
            "nonce": 958,
            "r": "0xfffffffffffffffffffffffffffffff000000000000000000000000000000000",
            "s": "0x7aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            "yParity": 1,
          },
          "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
          "factory": "0x7702",
          "factoryData": "0x",
          "maxPriorityFeePerGas": 1n,
          "nonce": 30902162761095135455113551806464n,
          "paymasterPostOpGasLimit": 0n,
          "paymasterVerificationGasLimit": 0n,
          "preVerificationGas": 92087n,
          "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        }
      `)
    }

    {
      const {
        account: _,
        callGasLimit,
        maxFeePerGas,
        verificationGasLimit,
        ...request
      } = await prepareUserOperation(bundlerClient, {
        account,
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
        maxFeePerGas: 2n,
      })

      expect(callGasLimit).toBeGreaterThanOrEqual(16000n)
      expect(maxFeePerGas).toBeGreaterThanOrEqual(0n)
      expect(verificationGasLimit).toBeGreaterThanOrEqual(90000n)
      expect(request).toMatchInlineSnapshot(`
        {
          "authorization": {
            "address": "0x081f08945fd17c5470f7bcee23fb57ab1099428e",
            "chainId": 1,
            "nonce": 958,
            "r": "0xfffffffffffffffffffffffffffffff000000000000000000000000000000000",
            "s": "0x7aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            "yParity": 1,
          },
          "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
          "factory": "0x7702",
          "factoryData": "0x",
          "maxPriorityFeePerGas": 2000000000n,
          "nonce": 30902162761113582199187261358080n,
          "paymasterPostOpGasLimit": 0n,
          "paymasterVerificationGasLimit": 0n,
          "preVerificationGas": 92087n,
          "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        }
      `)
    }

    {
      const {
        account: _,
        callGasLimit,
        maxFeePerGas,
        verificationGasLimit,
        ...request
      } = await prepareUserOperation(bundlerClient, {
        account,
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
        maxPriorityFeePerGas: 2n,
      })

      expect(callGasLimit).toBeGreaterThanOrEqual(16000n)
      expect(maxFeePerGas).toBeGreaterThanOrEqual(0n)
      expect(verificationGasLimit).toBeGreaterThanOrEqual(90000n)
      expect(request).toMatchInlineSnapshot(`
        {
          "authorization": {
            "address": "0x081f08945fd17c5470f7bcee23fb57ab1099428e",
            "chainId": 1,
            "nonce": 958,
            "r": "0xfffffffffffffffffffffffffffffff000000000000000000000000000000000",
            "s": "0x7aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            "yParity": 1,
          },
          "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
          "factory": "0x7702",
          "factoryData": "0x",
          "maxPriorityFeePerGas": 2n,
          "nonce": 30902162761132028943260970909696n,
          "paymasterPostOpGasLimit": 0n,
          "paymasterVerificationGasLimit": 0n,
          "preVerificationGas": 92087n,
          "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        }
      `)
    }
  })

  test('args: paymaster (address)', async () => {
    await expect(async () =>
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
    await expect(async () =>
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
    const paymaster = await getVerifyingPaymaster_08()
    const server = await createVerifyingPaymasterServer(client, { paymaster })

    const paymasterClient = createPaymasterClient({
      transport: http(server.url),
    })

    const bundlerClient = bundlerMainnet.getBundlerClient({
      client,
    })

    const {
      account: _,
      callGasLimit,
      nonce,
      paymasterData,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
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

    expect(nonce).toBeDefined()
    expect(callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(50000n)
    expect(paymasterData?.length).toBe(260)
    expect(request).toMatchInlineSnapshot(`
      {
        "authorization": {
          "address": "0x081f08945fd17c5470f7bcee23fb57ab1099428e",
          "chainId": 1,
          "nonce": 959,
          "r": "0xfffffffffffffffffffffffffffffff000000000000000000000000000000000",
          "s": "0x7aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "yParity": 1,
        },
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "factory": "0x7702",
        "factoryData": "0x",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "paymaster": "0x831c6c334f8ddee62246a5c81b82c8e18008b38f",
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "preVerificationGas": 100271n,
        "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
      }
    `)
  })

  test('args: paymaster (client w/ no chain)', async () => {
    const client = anvilMainnet.getClient({ account: true, chain: false })

    const paymaster = await getVerifyingPaymaster_08()
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
    const paymaster = await getVerifyingPaymaster_08()
    const server = await createVerifyingPaymasterServer(client, { paymaster })

    const paymasterClient = createPaymasterClient({
      transport: http(server.url),
    })

    const bundlerClient = bundlerMainnet.getBundlerClient({
      client,
    })

    const {
      account: _,
      callGasLimit,
      nonce,
      paymasterData,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
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

    expect(nonce).toBeDefined()
    expect(callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(50000n)
    expect(paymasterData?.length).toBe(260)
    expect(request).toMatchInlineSnapshot(`
      {
        "authorization": {
          "address": "0x081f08945fd17c5470f7bcee23fb57ab1099428e",
          "chainId": 1,
          "nonce": 961,
          "r": "0xfffffffffffffffffffffffffffffff000000000000000000000000000000000",
          "s": "0x7aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "yParity": 1,
        },
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "factory": "0x7702",
        "factoryData": "0x",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "paymaster": "0xc63db9682ff11707cadbd72bf1a0354a7fef143b",
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "preVerificationGas": 100271n,
        "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
      }
    `)
  })

  test('args: paymaster.getPaymasterStubData + paymaster.getPaymasterData', async () => {
    const paymaster = await getVerifyingPaymaster_08()
    const server = await createVerifyingPaymasterServer(client, { paymaster })

    const paymasterClient = createPaymasterClient({
      transport: http(server.url),
    })

    const bundlerClient = bundlerMainnet.getBundlerClient({
      client,
    })

    const {
      account: _,
      callGasLimit,
      nonce,
      paymasterData,
      preVerificationGas,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
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

    expect(nonce).toBeDefined()
    expect(callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(preVerificationGas).toBeGreaterThanOrEqual(50000n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(50000n)
    expect(paymasterData?.length).toBe(260)
    expect(request).toMatchInlineSnapshot(`
      {
        "authorization": {
          "address": "0x081f08945fd17c5470f7bcee23fb57ab1099428e",
          "chainId": 1,
          "nonce": 962,
          "r": "0xfffffffffffffffffffffffffffffff000000000000000000000000000000000",
          "s": "0x7aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "yParity": 1,
        },
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "factory": "0x7702",
        "factoryData": "0x",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "paymaster": "0xfc3983de3f7cbe1ba01084469779470ad0bbeffa",
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
      }
    `)
  })

  test('args: paymasterContext', async () => {
    const paymaster = await getVerifyingPaymaster_08()
    const server = await createVerifyingPaymasterServer(client, { paymaster })

    const paymasterClient = createPaymasterClient({
      transport: http(server.url),
    })

    const bundlerClient = bundlerMainnet.getBundlerClient({
      client,
    })

    const {
      account: _,
      callGasLimit,
      nonce,
      paymasterData,
      preVerificationGas,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
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

    expect(nonce).toBeDefined()
    expect(callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(paymasterData?.length).toBe(260)
    expect(preVerificationGas).toBeGreaterThanOrEqual(50000n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(50000n)
    expect(request).toMatchInlineSnapshot(`
      {
        "authorization": {
          "address": "0x081f08945fd17c5470f7bcee23fb57ab1099428e",
          "chainId": 1,
          "nonce": 963,
          "r": "0xfffffffffffffffffffffffffffffff000000000000000000000000000000000",
          "s": "0x7aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "yParity": 1,
        },
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "factory": "0x7702",
        "factoryData": "0x",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "paymaster": "0xf8b1d4d0a2dd9dd53200a4c6783a69c15e3a25f4",
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
      }
    `)
  })

  test('args: signature', async () => {
    const {
      callGasLimit,
      maxFeePerGas,
      preVerificationGas,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
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
      signature:
        '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c',
      ...fees,
    })

    expect(account).toBeDefined()
    expect(callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(maxFeePerGas).toBeGreaterThanOrEqual(0n)
    expect(preVerificationGas).toBeGreaterThanOrEqual(50000n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(90000n)
    expect({ ...request, account: undefined }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "authorization": {
          "address": "0x081f08945fd17c5470f7bcee23fb57ab1099428e",
          "chainId": 1,
          "nonce": 963,
          "r": "0xfffffffffffffffffffffffffffffff000000000000000000000000000000000",
          "s": "0x7aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "yParity": 1,
        },
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "factory": "0x7702",
        "factoryData": "0x",
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 30902162761279602895850647322624n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
      }
    `)
  })

  test('behavior: account.userOperation.estimateGas', async () => {
    const {
      account: _,
      callGasLimit,
      preVerificationGas,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
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

    expect(callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(preVerificationGas).toBeGreaterThanOrEqual(50000n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(90000n)
    expect(request).toMatchInlineSnapshot(`
      {
        "authorization": {
          "address": "0x081f08945fd17c5470f7bcee23fb57ab1099428e",
          "chainId": 1,
          "nonce": 963,
          "r": "0xfffffffffffffffffffffffffffffff000000000000000000000000000000000",
          "s": "0x7aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "yParity": 1,
        },
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "factory": "0x7702",
        "factoryData": "0x",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 30902162761298049639924356874240n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
      }
    `)
  })

  test('behavior: account.userOperation.estimateGas (all filled)', async () => {
    const {
      account: _,
      callGasLimit,
      preVerificationGas,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
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

    expect(callGasLimit).toBeGreaterThanOrEqual(1000000n)
    expect(preVerificationGas).toBeGreaterThanOrEqual(1000000n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(1000000n)
    expect(request).toMatchInlineSnapshot(`
      {
        "authorization": {
          "address": "0x081f08945fd17c5470f7bcee23fb57ab1099428e",
          "chainId": 1,
          "nonce": 963,
          "r": "0xfffffffffffffffffffffffffffffff000000000000000000000000000000000",
          "s": "0x7aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "yParity": 1,
        },
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "factory": "0x7702",
        "factoryData": "0x",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 30902162761316496383998066425856n,
        "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
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

    const {
      account: _,
      callGasLimit,
      preVerificationGas,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
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

    expect(callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(preVerificationGas).toBeGreaterThanOrEqual(50000n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(90000n)
    expect(request).toMatchInlineSnapshot(`
      {
        "authorization": {
          "address": "0x081f08945fd17c5470f7bcee23fb57ab1099428e",
          "chainId": 1,
          "nonce": 963,
          "r": "0xfffffffffffffffffffffffffffffff000000000000000000000000000000000",
          "s": "0x7aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "yParity": 1,
        },
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "factory": "0x7702",
        "factoryData": "0x",
        "maxFeePerGas": 3000000n,
        "maxPriorityFeePerGas": 1000000n,
        "nonce": 30902162761353389872145485529088n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
      }
    `)
  })

  test('behavior: bundlerClient.paymaster', async () => {
    const bundlerClient = bundlerMainnet.getBundlerClient({
      client,
      paymaster: true,
    })

    await expect(async () =>
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
    const paymaster = await getVerifyingPaymaster_08()
    const server = await createVerifyingPaymasterServer(client, { paymaster })

    const paymasterClient = createPaymasterClient({
      transport: http(server.url),
    })

    const bundlerClient = bundlerMainnet.getBundlerClient({
      client,
      paymaster: paymasterClient,
    })

    const {
      account: _,
      callGasLimit,
      nonce,
      paymasterData,
      preVerificationGas,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
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

    expect(nonce).toBeDefined()
    expect(callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(paymasterData?.length).toBe(260)
    expect(preVerificationGas).toBeGreaterThanOrEqual(50000n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(50000n)
    expect(request).toMatchInlineSnapshot(`
      {
        "authorization": {
          "address": "0x081f08945fd17c5470f7bcee23fb57ab1099428e",
          "chainId": 1,
          "nonce": 964,
          "r": "0xfffffffffffffffffffffffffffffff000000000000000000000000000000000",
          "s": "0x7aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "yParity": 1,
        },
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "factory": "0x7702",
        "factoryData": "0x",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "paymaster": "0xd6b8eb34413f07a1a67a469345cfea6633efd58d",
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
      }
    `)
  })

  test('behavior: client.paymaster.getPaymasterData', async () => {
    const paymaster = await getVerifyingPaymaster_08()
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

    const {
      account: _,
      callGasLimit,
      nonce,
      paymasterData,
      preVerificationGas,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
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

    expect(nonce).toBeDefined()
    expect(callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(paymasterData?.length).toBe(260)
    expect(preVerificationGas).toBeGreaterThanOrEqual(50000n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(50000n)
    expect(request).toMatchInlineSnapshot(`
      {
        "authorization": {
          "address": "0x081f08945fd17c5470f7bcee23fb57ab1099428e",
          "chainId": 1,
          "nonce": 965,
          "r": "0xfffffffffffffffffffffffffffffff000000000000000000000000000000000",
          "s": "0x7aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "yParity": 1,
        },
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "factory": "0x7702",
        "factoryData": "0x",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "paymaster": "0x9cc87998ba85d81e017e6b7662ac00ee2ab8fe13",
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
      }
    `)
  })

  test('behavior: client.paymaster.getPaymasterStubData + client.paymaster.getPaymasterData', async () => {
    const paymaster = await getVerifyingPaymaster_08()
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

    const {
      account: _,
      callGasLimit,
      nonce,
      paymasterData,
      preVerificationGas,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
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

    expect(nonce).toBeDefined()
    expect(callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(paymasterData?.length).toBe(260)
    expect(preVerificationGas).toBeGreaterThanOrEqual(50000n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(50000n)
    expect(request).toMatchInlineSnapshot(`
      {
        "authorization": {
          "address": "0x081f08945fd17c5470f7bcee23fb57ab1099428e",
          "chainId": 1,
          "nonce": 966,
          "r": "0xfffffffffffffffffffffffffffffff000000000000000000000000000000000",
          "s": "0x7aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "yParity": 1,
        },
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "factory": "0x7702",
        "factoryData": "0x",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "paymaster": "0xb1fc11f03b084fff8dae95fa08e8d69ad2547ec1",
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
      }
    `)
  })

  test('behavior: bundlerClient.paymasterContext', async () => {
    const paymaster = await getVerifyingPaymaster_08()
    const server = await createVerifyingPaymasterServer(client, { paymaster })

    const paymasterClient = createPaymasterClient({
      transport: http(server.url),
    })

    const bundlerClient = bundlerMainnet.getBundlerClient({
      client,
      paymaster: paymasterClient,
      paymasterContext: { validUntil: 3735928600 },
    })

    const {
      account: _,
      callGasLimit,
      nonce,
      paymasterData,
      preVerificationGas,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
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

    expect(nonce).toBeDefined()
    expect(callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(paymasterData?.length).toBe(260)
    expect(preVerificationGas).toBeGreaterThanOrEqual(50000n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(50000n)
    expect(request).toMatchInlineSnapshot(`
      {
        "authorization": {
          "address": "0x081f08945fd17c5470f7bcee23fb57ab1099428e",
          "chainId": 1,
          "nonce": 967,
          "r": "0xfffffffffffffffffffffffffffffff000000000000000000000000000000000",
          "s": "0x7aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "yParity": 1,
        },
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "factory": "0x7702",
        "factoryData": "0x",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "paymaster": "0x453439300b6c5c645737324b990f2d51137027bc",
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
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

describe('entryPointVersion: 0.7', async () => {
  const [account] = await getSmartAccounts_07()

  test('default', async () => {
    const {
      account: _,
      callGasLimit,
      maxFeePerGas,
      nonce,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
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

    expect(nonce).toBeDefined()
    expect(callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(maxFeePerGas).toBeGreaterThanOrEqual(0n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(190000n)

    expect(request).toMatchInlineSnapshot(`
      {
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "factory": "0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxPriorityFeePerGas": 2000000000n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 53477n,
        "sender": "0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
      }
    `)
  })

  test('args: callData', async () => {
    const {
      account: _,
      callGasLimit,
      maxFeePerGas,
      nonce,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
      account,
      callData:
        '0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
      ...fees,
    })

    expect(nonce).toBeDefined()
    expect(callGasLimit).toBeGreaterThanOrEqual(10000n)
    expect(maxFeePerGas).toBeGreaterThanOrEqual(0n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(190000n)
    expect(request).toMatchInlineSnapshot(`
      {
        "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "factory": "0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxPriorityFeePerGas": 2000000000n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 51682n,
        "sender": "0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
      }
    `)
  })

  test('args: parameters (no factory)', async () => {
    const {
      account: _,
      callGasLimit,
      maxFeePerGas,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
      account,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      parameters: ['gas', 'nonce'],
      ...fees,
    })

    expect(callGasLimit).toBeGreaterThanOrEqual(10000n)
    expect(maxFeePerGas).toBeGreaterThanOrEqual(0n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(190000n)
    expect(request).toMatchInlineSnapshot(`
      {
        "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 30902162761058241966966132703232n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 51682n,
        "sender": "0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea",
      }
    `)
  })

  test('args: parameters (no nonce)', async () => {
    const {
      account: _,
      callGasLimit,
      maxFeePerGas,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
      account,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      parameters: ['gas', 'factory'],
      ...fees,
    })

    expect(callGasLimit).toBeGreaterThanOrEqual(10000n)
    expect(maxFeePerGas).toBeGreaterThanOrEqual(0n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(190000n)
    expect(request).toMatchInlineSnapshot(`
      {
        "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "factory": "0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxPriorityFeePerGas": 2000000000n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 51682n,
        "sender": "0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea",
      }
    `)
  })

  test('args: nonce', async () => {
    const {
      account: _,
      callGasLimit,
      maxFeePerGas,
      nonce: __,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
      account,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      nonce: 0n,
      ...fees,
    })

    expect(callGasLimit).toBeGreaterThanOrEqual(10000n)
    expect(maxFeePerGas).toBeGreaterThanOrEqual(0n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(190000n)
    expect(request).toMatchInlineSnapshot(`
      {
        "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "factory": "0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxPriorityFeePerGas": 2000000000n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 51682n,
        "sender": "0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
      }
    `)
  })

  test('args: fees', async () => {
    {
      const {
        account: _,
        callGasLimit,
        maxFeePerGas,
        nonce,
        verificationGasLimit,
        ...request
      } = await prepareUserOperation(bundlerClient, {
        account,
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
        maxFeePerGas: 2n,
        maxPriorityFeePerGas: 1n,
      })

      expect(nonce).toBeDefined()
      expect(callGasLimit).toBeGreaterThanOrEqual(10000n)
      expect(maxFeePerGas).toBeGreaterThanOrEqual(0n)
      expect(verificationGasLimit).toBeGreaterThanOrEqual(190000n)
      expect(request).toMatchInlineSnapshot(`
        {
          "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
          "factory": "0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688",
          "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
          "maxPriorityFeePerGas": 1n,
          "paymasterPostOpGasLimit": 0n,
          "paymasterVerificationGasLimit": 0n,
          "preVerificationGas": 51682n,
          "sender": "0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea",
          "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        }
      `)
    }

    {
      const {
        account: _,
        callGasLimit,
        maxFeePerGas,
        nonce,
        verificationGasLimit,
        ...request
      } = await prepareUserOperation(bundlerClient, {
        account,
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
        maxFeePerGas: 2n,
      })

      expect(nonce).toBeDefined()
      expect(callGasLimit).toBeGreaterThanOrEqual(10000n)
      expect(maxFeePerGas).toBeGreaterThanOrEqual(0n)
      expect(verificationGasLimit).toBeGreaterThanOrEqual(190000n)
      expect(request).toMatchInlineSnapshot(`
        {
          "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
          "factory": "0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688",
          "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
          "maxPriorityFeePerGas": 2000000000n,
          "paymasterPostOpGasLimit": 0n,
          "paymasterVerificationGasLimit": 0n,
          "preVerificationGas": 51682n,
          "sender": "0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea",
          "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        }
      `)
    }

    {
      const {
        account: _,
        callGasLimit,
        maxFeePerGas,
        nonce,
        verificationGasLimit,
        ...request
      } = await prepareUserOperation(bundlerClient, {
        account,
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
        maxPriorityFeePerGas: 2n,
      })

      expect(nonce).toBeDefined()
      expect(callGasLimit).toBeGreaterThanOrEqual(10000n)
      expect(maxFeePerGas).toBeGreaterThanOrEqual(0n)
      expect(verificationGasLimit).toBeGreaterThanOrEqual(190000n)
      expect(request).toMatchInlineSnapshot(`
        {
          "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
          "factory": "0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688",
          "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
          "maxPriorityFeePerGas": 2n,
          "paymasterPostOpGasLimit": 0n,
          "paymasterVerificationGasLimit": 0n,
          "preVerificationGas": 51682n,
          "sender": "0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea",
          "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
        }
      `)
    }
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

    const {
      account: _,
      callGasLimit,
      nonce,
      paymasterData,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
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

    expect(nonce).toBeDefined()
    expect(callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(190000n)
    expect(paymasterData?.length).toBe(260)
    expect(request).toMatchInlineSnapshot(`
      {
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "factory": "0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "paymaster": "0x7306a649b451ae08781108445425bd4e8acf1e00",
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "preVerificationGas": 59866n,
        "sender": "0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
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

    const {
      account: _,
      callGasLimit,
      nonce,
      paymasterData,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
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

    expect(nonce).toBeDefined()
    expect(callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(190000n)
    expect(paymasterData?.length).toBe(260)
    expect(request).toMatchInlineSnapshot(`
      {
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "factory": "0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "paymaster": "0x934a389cabfb84cdb3f0260b2a4fd575b8b345a3",
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "preVerificationGas": 59866n,
        "sender": "0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
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

    const {
      account: _,
      callGasLimit,
      nonce,
      paymasterData,
      preVerificationGas,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
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

    expect(nonce).toBeDefined()
    expect(callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(preVerificationGas).toBeGreaterThanOrEqual(50000n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(190000n)
    expect(paymasterData?.length).toBe(260)
    expect(request).toMatchInlineSnapshot(`
      {
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "factory": "0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "paymaster": "0xc91b651f770ed996a223a16da9ccd6f7df56c987",
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "sender": "0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
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

    const {
      account: _,
      callGasLimit,
      nonce,
      paymasterData,
      preVerificationGas,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
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

    expect(nonce).toBeDefined()
    expect(callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(paymasterData?.length).toBe(260)
    expect(preVerificationGas).toBeGreaterThanOrEqual(50000n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(190000n)
    expect(request).toMatchInlineSnapshot(`
      {
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "factory": "0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "paymaster": "0xb90acf57c3bfe8e0e8215defc282b5f48b3edc74",
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "sender": "0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
      }
    `)
  })

  test('args: signature', async () => {
    const {
      callGasLimit,
      maxFeePerGas,
      nonce,
      preVerificationGas,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
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

    expect(account).toBeDefined()
    expect(callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(maxFeePerGas).toBeGreaterThanOrEqual(0n)
    expect(nonce).toBeDefined()
    expect(preVerificationGas).toBeGreaterThanOrEqual(50000n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(190000n)
    expect({ ...request, account: undefined }).toMatchInlineSnapshot(`
      {
        "account": undefined,
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "factory": "0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxPriorityFeePerGas": 2000000000n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "sender": "0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea",
        "signature": "0xdeadbeef",
      }
    `)
  })

  test('behavior: account.userOperation.estimateGas', async () => {
    const {
      account: _,
      callGasLimit,
      nonce,
      preVerificationGas,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
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

    expect(callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(nonce).toBeDefined()
    expect(preVerificationGas).toBeGreaterThanOrEqual(50000n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(1000000n)
    expect(request).toMatchInlineSnapshot(`
      {
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "factory": "0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "sender": "0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
      }
    `)
  })

  test('behavior: account.userOperation.estimateGas (all filled)', async () => {
    const {
      account: _,
      callGasLimit,
      nonce,
      preVerificationGas,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
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

    expect(nonce).toBeDefined()
    expect(callGasLimit).toBeGreaterThanOrEqual(1000000n)
    expect(preVerificationGas).toBeGreaterThanOrEqual(1000000n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(1000000n)
    expect(request).toMatchInlineSnapshot(`
      {
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "factory": "0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "sender": "0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
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

    const {
      account: _,
      callGasLimit,
      nonce,
      preVerificationGas,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
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

    expect(nonce).toBeDefined()
    expect(callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(preVerificationGas).toBeGreaterThanOrEqual(50000n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(190000n)
    expect(request).toMatchInlineSnapshot(`
      {
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "factory": "0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": 3000000n,
        "maxPriorityFeePerGas": 1000000n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "sender": "0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
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

    const {
      account: _,
      callGasLimit,
      nonce,
      paymasterData,
      preVerificationGas,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
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

    expect(nonce).toBeDefined()
    expect(callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(paymasterData?.length).toBe(260)
    expect(preVerificationGas).toBeGreaterThanOrEqual(50000n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(190000n)
    expect(request).toMatchInlineSnapshot(`
      {
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "factory": "0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "paymaster": "0x787c6666213624d788522d516847978d7f348902",
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "sender": "0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
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

    const {
      account: _,
      callGasLimit,
      nonce,
      paymasterData,
      preVerificationGas,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
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

    expect(nonce).toBeDefined()
    expect(callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(paymasterData?.length).toBe(260)
    expect(preVerificationGas).toBeGreaterThanOrEqual(50000n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(190000n)
    expect(request).toMatchInlineSnapshot(`
      {
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "factory": "0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "paymaster": "0x88d3caad49fc2e8e38c812c5f4acdd0a8b065f66",
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "sender": "0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
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

    const {
      account: _,
      callGasLimit,
      nonce,
      paymasterData,
      preVerificationGas,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
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

    expect(nonce).toBeDefined()
    expect(callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(paymasterData?.length).toBe(260)
    expect(preVerificationGas).toBeGreaterThanOrEqual(50000n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(190000n)
    expect(request).toMatchInlineSnapshot(`
      {
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "factory": "0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "paymaster": "0x10d16e2a026c4b5264a2aac51ca65749cdf2037e",
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "sender": "0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
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

    const {
      account: _,
      callGasLimit,
      nonce,
      paymasterData,
      preVerificationGas,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
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

    expect(nonce).toBeDefined()
    expect(callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(paymasterData?.length).toBe(260)
    expect(preVerificationGas).toBeGreaterThanOrEqual(50000n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(190000n)
    expect(request).toMatchInlineSnapshot(`
      {
        "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
        "factory": "0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxFeePerGas": 15000000000n,
        "maxPriorityFeePerGas": 2000000000n,
        "paymaster": "0xaf7868a9bb72e16b930d50636519038d7f057470",
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "sender": "0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
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
    const {
      account: _,
      callGasLimit,
      maxFeePerGas,
      nonce,
      preVerificationGas,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
      account,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      ...fees,
    })
    expect(nonce).toBeDefined()
    expect(callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(maxFeePerGas).toBeGreaterThanOrEqual(15000000000n)
    expect(preVerificationGas).toBeGreaterThanOrEqual(55000n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(113000n)
    expect(request).toMatchInlineSnapshot(`
      {
        "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "initCode": "0x98f74b7c96497070ba5052e02832ef9892962e62f14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxPriorityFeePerGas": 2000000000n,
        "paymasterAndData": "0x",
        "paymasterPostOpGasLimit": undefined,
        "paymasterVerificationGasLimit": undefined,
        "sender": "0xc312a51324F449CF2389749B84Df3617373F2397",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
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

    const {
      account: _,
      callGasLimit,
      maxFeePerGas,
      nonce,
      preVerificationGas,
      verificationGasLimit,
      ...request
    } = await prepareUserOperation(bundlerClient, {
      account,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      parameters: ['gas', 'nonce'],
      ...fees,
    })
    expect(nonce).toBeDefined()
    expect(callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(maxFeePerGas).toBeGreaterThanOrEqual(15000000000n)
    expect(preVerificationGas).toBeGreaterThanOrEqual(54000n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(110000n)
    expect(request).toMatchInlineSnapshot(`
      {
        "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "initCode": "0x",
        "maxPriorityFeePerGas": 2000000000n,
        "paymasterAndData": "0x",
        "paymasterPostOpGasLimit": undefined,
        "paymasterVerificationGasLimit": undefined,
        "sender": "0xc312a51324F449CF2389749B84Df3617373F2397",
      }
    `)
  })
})
