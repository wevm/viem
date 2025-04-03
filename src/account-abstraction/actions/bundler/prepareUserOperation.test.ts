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
    const {
      account: account_,
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
        "factory": "0xea2e668d430e5aa15baba2f5c5edfd4f9ef6eb73",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxPriorityFeePerGas": 2000000000n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 53477n,
        "sender": "0x5DE8369D07A58C1d371A091979956d08b40ceA59",
        "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
      }
    `)
  })

  test('args: callData', async () => {
    const {
      account: account_,
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
        "factory": "0xea2e668d430e5aa15baba2f5c5edfd4f9ef6eb73",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxPriorityFeePerGas": 2000000000n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 51682n,
        "sender": "0x5DE8369D07A58C1d371A091979956d08b40ceA59",
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
        "sender": "0x5DE8369D07A58C1d371A091979956d08b40ceA59",
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
        "factory": "0xea2e668d430e5aa15baba2f5c5edfd4f9ef6eb73",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxPriorityFeePerGas": 2000000000n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 51682n,
        "sender": "0x5DE8369D07A58C1d371A091979956d08b40ceA59",
      }
    `)
  })

  test('args: nonce', async () => {
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
      nonce: 0n,
      ...fees,
    })

    expect(nonce).toBeDefined()
    expect(callGasLimit).toBeGreaterThanOrEqual(10000n)
    expect(maxFeePerGas).toBeGreaterThanOrEqual(0n)
    expect(verificationGasLimit).toBeGreaterThanOrEqual(190000n)
    expect(request).toMatchInlineSnapshot(`
      {
        "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
        "factory": "0xea2e668d430e5aa15baba2f5c5edfd4f9ef6eb73",
        "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 0n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 51682n,
        "sender": "0x5DE8369D07A58C1d371A091979956d08b40ceA59",
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
            "factory": "0xea2e668d430e5aa15baba2f5c5edfd4f9ef6eb73",
            "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
            "maxPriorityFeePerGas": 2000000000n,
            "paymasterPostOpGasLimit": 0n,
            "paymasterVerificationGasLimit": 0n,
            "preVerificationGas": 51682n,
            "sender": "0x5DE8369D07A58C1d371A091979956d08b40ceA59",
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
              "factory": "0xea2e668d430e5aa15baba2f5c5edfd4f9ef6eb73",
              "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
              "maxPriorityFeePerGas": 1n,
              "paymasterPostOpGasLimit": 0n,
              "paymasterVerificationGasLimit": 0n,
              "preVerificationGas": 51682n,
              "sender": "0x5DE8369D07A58C1d371A091979956d08b40ceA59",
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
              "factory": "0xea2e668d430e5aa15baba2f5c5edfd4f9ef6eb73",
              "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
              "maxPriorityFeePerGas": 2000000000n,
              "paymasterPostOpGasLimit": 0n,
              "paymasterVerificationGasLimit": 0n,
              "preVerificationGas": 51682n,
              "sender": "0x5DE8369D07A58C1d371A091979956d08b40ceA59",
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
              "callData": "0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
              "factory": "0xea2e668d430e5aa15baba2f5c5edfd4f9ef6eb73",
              "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
              "maxPriorityFeePerGas": 2n,
              "paymasterPostOpGasLimit": 0n,
              "paymasterVerificationGasLimit": 0n,
              "preVerificationGas": 51682n,
              "sender": "0x5DE8369D07A58C1d371A091979956d08b40ceA59",
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
            "factory": "0xea2e668d430e5aa15baba2f5c5edfd4f9ef6eb73",
            "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
            "maxFeePerGas": 15000000000n,
            "maxPriorityFeePerGas": 2000000000n,
            "paymaster": "0x2c56932223cde0d363266f1308c48ff1bf9f9041",
            "paymasterPostOpGasLimit": 1000000n,
            "paymasterVerificationGasLimit": 1000000n,
            "preVerificationGas": 59866n,
            "sender": "0x5DE8369D07A58C1d371A091979956d08b40ceA59",
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
            "factory": "0xea2e668d430e5aa15baba2f5c5edfd4f9ef6eb73",
            "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
            "maxFeePerGas": 15000000000n,
            "maxPriorityFeePerGas": 2000000000n,
            "paymaster": "0xda796117bf6905dd8db2ff1ab4397f6d2c4adda3",
            "paymasterPostOpGasLimit": 1000000n,
            "paymasterVerificationGasLimit": 1000000n,
            "preVerificationGas": 59866n,
            "sender": "0x5DE8369D07A58C1d371A091979956d08b40ceA59",
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
            "factory": "0xea2e668d430e5aa15baba2f5c5edfd4f9ef6eb73",
            "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
            "maxFeePerGas": 15000000000n,
            "maxPriorityFeePerGas": 2000000000n,
            "paymaster": "0x222d74f33b0d07687a769a44399e2272a4cb9ffe",
            "paymasterPostOpGasLimit": 1000000n,
            "paymasterVerificationGasLimit": 1000000n,
            "sender": "0x5DE8369D07A58C1d371A091979956d08b40ceA59",
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
            "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
            "factory": "0xea2e668d430e5aa15baba2f5c5edfd4f9ef6eb73",
            "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
            "maxFeePerGas": 15000000000n,
            "maxPriorityFeePerGas": 2000000000n,
            "paymaster": "0x88777418972fb3f58489303d763d4daf398a6527",
            "paymasterPostOpGasLimit": 1000000n,
            "paymasterVerificationGasLimit": 1000000n,
            "sender": "0x5DE8369D07A58C1d371A091979956d08b40ceA59",
            "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
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
            "account": undefined,
            "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
            "factory": "0xea2e668d430e5aa15baba2f5c5edfd4f9ef6eb73",
            "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
            "maxPriorityFeePerGas": 2000000000n,
            "paymasterPostOpGasLimit": 0n,
            "paymasterVerificationGasLimit": 0n,
            "sender": "0x5DE8369D07A58C1d371A091979956d08b40ceA59",
            "signature": "0xdeadbeef",
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
            "factory": "0xea2e668d430e5aa15baba2f5c5edfd4f9ef6eb73",
            "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
            "maxFeePerGas": 15000000000n,
            "maxPriorityFeePerGas": 2000000000n,
            "paymasterPostOpGasLimit": 0n,
            "paymasterVerificationGasLimit": 0n,
            "sender": "0x5DE8369D07A58C1d371A091979956d08b40ceA59",
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
            "factory": "0xea2e668d430e5aa15baba2f5c5edfd4f9ef6eb73",
            "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
            "maxFeePerGas": 15000000000n,
            "maxPriorityFeePerGas": 2000000000n,
            "sender": "0x5DE8369D07A58C1d371A091979956d08b40ceA59",
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
            "factory": "0xea2e668d430e5aa15baba2f5c5edfd4f9ef6eb73",
            "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
            "maxFeePerGas": 3000000n,
            "maxPriorityFeePerGas": 1000000n,
            "paymasterPostOpGasLimit": 0n,
            "paymasterVerificationGasLimit": 0n,
            "sender": "0x5DE8369D07A58C1d371A091979956d08b40ceA59",
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
            "factory": "0xea2e668d430e5aa15baba2f5c5edfd4f9ef6eb73",
            "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
            "maxFeePerGas": 15000000000n,
            "maxPriorityFeePerGas": 2000000000n,
            "paymaster": "0x4728af32823cf144586dab95632156cc81bb0203",
            "paymasterPostOpGasLimit": 1000000n,
            "paymasterVerificationGasLimit": 1000000n,
            "sender": "0x5DE8369D07A58C1d371A091979956d08b40ceA59",
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
            "factory": "0xea2e668d430e5aa15baba2f5c5edfd4f9ef6eb73",
            "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
            "maxFeePerGas": 15000000000n,
            "maxPriorityFeePerGas": 2000000000n,
            "paymaster": "0x37d0ed258f37a966f33b75b5ae7486917a0ae614",
            "paymasterPostOpGasLimit": 1000000n,
            "paymasterVerificationGasLimit": 1000000n,
            "sender": "0x5DE8369D07A58C1d371A091979956d08b40ceA59",
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
            "factory": "0xea2e668d430e5aa15baba2f5c5edfd4f9ef6eb73",
            "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
            "maxFeePerGas": 15000000000n,
            "maxPriorityFeePerGas": 2000000000n,
            "paymaster": "0x294c69bd8415219b41b68a2f065deabb950dd489",
            "paymasterPostOpGasLimit": 1000000n,
            "paymasterVerificationGasLimit": 1000000n,
            "sender": "0x5DE8369D07A58C1d371A091979956d08b40ceA59",
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
          {
            "callData": "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000",
            "factory": "0xea2e668d430e5aa15baba2f5c5edfd4f9ef6eb73",
            "factoryData": "0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
            "maxFeePerGas": 15000000000n,
            "maxPriorityFeePerGas": 2000000000n,
            "paymaster": "0x48288d0e3079a03f6ec1846554cfc58c2696aaee",
            "paymasterPostOpGasLimit": 1000000n,
            "paymasterVerificationGasLimit": 1000000n,
            "sender": "0x5DE8369D07A58C1d371A091979956d08b40ceA59",
            "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
          }
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
        "initCode": "0xc565eb7363769f8ffae0005285ccd854c631a0a0f14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
        "maxPriorityFeePerGas": 2000000000n,
        "nonce": 30902162761021348478818713600000n,
        "paymasterAndData": "0x",
        "paymasterPostOpGasLimit": undefined,
        "paymasterVerificationGasLimit": undefined,
        "sender": "0x5d146EE4f31D852361f18B9CFCc510f773d6BC78",
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
            "initCode": "0xc565eb7363769f8ffae0005285ccd854c631a0a0f14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000",
            "maxPriorityFeePerGas": 2000000000n,
            "paymasterAndData": "0x",
            "paymasterPostOpGasLimit": undefined,
            "paymasterVerificationGasLimit": undefined,
            "sender": "0x5d146EE4f31D852361f18B9CFCc510f773d6BC78",
            "signature": "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
          }
        `)
  })
})
