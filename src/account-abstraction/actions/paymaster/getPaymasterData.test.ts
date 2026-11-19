import { describe, expect, test } from 'vitest'
import {
  createVerifyingPaymasterServer,
  getSmartAccounts_07,
  getSmartAccounts_08,
  getVerifyingPaymaster_07,
  getVerifyingPaymaster_08,
} from '~test/account-abstraction.js'
import { anvilMainnet } from '~test/anvil.js'
import { bundlerMainnet } from '~test/bundler.js'
import { createHttpServer } from '~test/utils.js'
import { mine, signAuthorization } from '../../../actions/index.js'
import { http } from '../../../clients/transports/http.js'
import { parseEther } from '../../../utils/index.js'
import { createPaymasterClient } from '../../clients/createPaymasterClient.js'
import { estimateUserOperationGas } from '../bundler/estimateUserOperationGas.js'
import { getUserOperationReceipt } from '../bundler/getUserOperationReceipt.js'
import { prepareUserOperation } from '../bundler/prepareUserOperation.js'
import { sendUserOperation } from '../bundler/sendUserOperation.js'
import { getPaymasterData } from './getPaymasterData.js'
import { getPaymasterStubData } from './getPaymasterStubData.js'

const client = anvilMainnet.getClient({ account: true })
const bundlerClient = bundlerMainnet.getBundlerClient({ client })

describe('entryPointVersion: 0.8', async () => {
  const [account] = await getSmartAccounts_08()
  const paymaster = await getVerifyingPaymaster_08()
  const server = await createVerifyingPaymasterServer(client, { paymaster })

  test('default', async () => {
    const paymasterClient = createPaymasterClient({
      transport: http(server.url),
    })

    const userOperation = await prepareUserOperation(bundlerClient, {
      account,
      calls: [
        {
          to: '0x0000000000000000000000000000000000000000',
          value: parseEther('1'),
        },
      ],
      parameters: ['authorization', 'factory', 'fees', 'nonce', 'signature'],
    })

    const { paymaster, paymasterData, ...userOperation_paymasterStub } =
      await getPaymasterStubData(paymasterClient, {
        chainId: bundlerClient.chain.id,
        entryPointAddress: account.entryPoint.address,
        ...userOperation,
      })
    expect(paymaster).toBeDefined()
    expect(paymasterData).toBeDefined()
    expect(userOperation_paymasterStub).toMatchInlineSnapshot(`
      {
        "isFinal": false,
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "sponsor": {
          "name": "Viem Sugar Daddy",
        },
      }
    `)

    const userOperation_gas = await estimateUserOperationGas(bundlerClient, {
      ...userOperation,
      ...userOperation_paymasterStub,
    })
    userOperation_gas.preVerificationGas = 100_000n

    expect(userOperation_gas.callGasLimit).toBeGreaterThanOrEqual(10000n)
    expect(userOperation_gas.preVerificationGas).toBeGreaterThanOrEqual(100000n)
    expect(userOperation_gas.verificationGasLimit).toBeGreaterThanOrEqual(
      50000n,
    )
    expect(userOperation_gas.paymasterPostOpGasLimit).toBe(0n)
    expect(userOperation_gas.paymasterVerificationGasLimit).toBe(0n)

    const userOperation_paymaster = await getPaymasterData(paymasterClient, {
      chainId: bundlerClient.chain.id,
      entryPointAddress: account.entryPoint.address,
      ...userOperation,
      ...userOperation_gas,
      ...userOperation_paymasterStub,
    })

    const authorization = await signAuthorization(client, account.authorization)
    const hash = await sendUserOperation(bundlerClient, {
      ...userOperation,
      ...userOperation_gas,
      ...userOperation_paymaster,
      authorization,
      signature: undefined,
    })
    expect(hash).toBeDefined()

    await bundlerClient.request({
      method: 'debug_bundler_sendBundleNow',
    })
    await mine(client, {
      blocks: 1,
    })

    const receipt = await getUserOperationReceipt(bundlerClient, { hash })
    expect(receipt.success).toBeTruthy()
  })
})

describe('entryPointVersion: 0.7', async () => {
  const [account] = await getSmartAccounts_07()
  const paymaster = await getVerifyingPaymaster_07()
  const server = await createVerifyingPaymasterServer(client, { paymaster })

  test('default', async () => {
    const paymasterClient = createPaymasterClient({
      transport: http(server.url),
    })

    const userOperation = await prepareUserOperation(bundlerClient, {
      account,
      calls: [
        {
          to: '0x0000000000000000000000000000000000000000',
          value: parseEther('1'),
        },
      ],
      parameters: ['factory', 'fees', 'nonce', 'signature'],
    })

    const { paymaster, paymasterData, ...userOperation_paymasterStub } =
      await getPaymasterStubData(paymasterClient, {
        chainId: bundlerClient.chain.id,
        entryPointAddress: account.entryPoint.address,
        ...userOperation,
      })
    expect(paymaster).toBeDefined()
    expect(paymasterData).toBeDefined()
    expect(userOperation_paymasterStub).toMatchInlineSnapshot(`
      {
        "isFinal": false,
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "sponsor": {
          "name": "Viem Sugar Daddy",
        },
      }
    `)

    const userOperation_gas = await estimateUserOperationGas(bundlerClient, {
      ...userOperation,
      ...userOperation_paymasterStub,
    })
    userOperation_gas.preVerificationGas = 100_000n

    expect(userOperation_gas.callGasLimit).toBeGreaterThanOrEqual(10000n)
    expect(userOperation_gas.preVerificationGas).toBeGreaterThanOrEqual(100000n)
    expect(userOperation_gas.verificationGasLimit).toBeGreaterThanOrEqual(
      220000n,
    )
    expect(userOperation_gas.paymasterPostOpGasLimit).toBe(0n)
    expect(userOperation_gas.paymasterVerificationGasLimit).toBe(0n)

    const userOperation_paymaster = await getPaymasterData(paymasterClient, {
      chainId: bundlerClient.chain.id,
      entryPointAddress: account.entryPoint.address,
      ...userOperation,
      ...userOperation_gas,
      ...userOperation_paymasterStub,
    })

    const hash = await sendUserOperation(bundlerClient, {
      ...userOperation,
      ...userOperation_gas,
      ...userOperation_paymaster,
      signature: undefined,
    })
    expect(hash).toBeDefined()

    await bundlerClient.request({
      method: 'debug_bundler_sendBundleNow',
    })
    await mine(client, {
      blocks: 1,
    })

    const receipt = await getUserOperationReceipt(bundlerClient, { hash })
    expect(receipt.success).toBeTruthy()
  })
})

test('behavior: returns paymaster fields only', async () => {
  const server = await createHttpServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        result: {
          paymaster: '0x0000000000000000000000000000000000000001',
          paymasterData: '0xdeadbeef',
          paymasterPostOpGasLimit: '0x1',
          paymasterVerificationGasLimit: '0x2',
          callData: '0xcafebabe',
          maxFeePerGas: '0x3',
          maxPriorityFeePerGas: '0x4',
          nonce: '0x5',
          sender: '0x0000000000000000000000000000000000000002',
        },
      }),
    )
  })
  const paymasterClient = createPaymasterClient({
    transport: http(server.url),
  })

  const result = await getPaymasterData(paymasterClient, {
    callData: '0x',
    chainId: 1,
    entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    nonce: 0n,
    sender: '0x0000000000000000000000000000000000000003',
  })

  expect(result).toMatchInlineSnapshot(`
    {
      "paymaster": "0x0000000000000000000000000000000000000001",
      "paymasterData": "0xdeadbeef",
      "paymasterPostOpGasLimit": 1n,
      "paymasterVerificationGasLimit": 2n,
    }
  `)

  await server.close()
})
