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
import { http } from '../../../clients/transports/http.js'
import { parseEther } from '../../../utils/index.js'
import { createPaymasterClient } from '../../clients/createPaymasterClient.js'
import { estimateUserOperationGas } from '../bundler/estimateUserOperationGas.js'
import { prepareUserOperation } from '../bundler/prepareUserOperation.js'
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

    const { paymaster, paymasterData, ...userOperation_paymaster } =
      await getPaymasterStubData(paymasterClient, {
        chainId: bundlerClient.chain.id,
        entryPointAddress: account.entryPoint.address,
        ...userOperation,
      })
    expect(paymaster).toBeDefined()
    expect(paymasterData).toBeDefined()
    expect(userOperation_paymaster).toMatchInlineSnapshot(`
      {
        "isFinal": false,
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "sponsor": {
          "name": "Viem Sugar Daddy",
        },
      }
    `)

    const { preVerificationGas, ...userOperation_gas } =
      await estimateUserOperationGas(bundlerClient, {
        ...userOperation,
        ...userOperation_paymaster,
      })
    expect(preVerificationGas).toBeDefined()
    expect(userOperation_gas.callGasLimit).toBeGreaterThanOrEqual(10000n)
    expect(userOperation_gas.verificationGasLimit).toBeGreaterThanOrEqual(
      97000n,
    )
    expect(userOperation_gas.paymasterPostOpGasLimit).toBe(0n)
    expect(userOperation_gas.paymasterVerificationGasLimit).toBe(0n)
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

    const { paymaster, paymasterData, ...userOperation_paymaster } =
      await getPaymasterStubData(paymasterClient, {
        chainId: bundlerClient.chain.id,
        entryPointAddress: account.entryPoint.address,
        ...userOperation,
      })
    expect(paymaster).toBeDefined()
    expect(paymasterData).toBeDefined()
    expect(userOperation_paymaster).toMatchInlineSnapshot(`
      {
        "isFinal": false,
        "paymasterPostOpGasLimit": 1000000n,
        "paymasterVerificationGasLimit": 1000000n,
        "sponsor": {
          "name": "Viem Sugar Daddy",
        },
      }
    `)

    const { preVerificationGas, ...userOperation_gas } =
      await estimateUserOperationGas(bundlerClient, {
        ...userOperation,
        ...userOperation_paymaster,
      })
    expect(preVerificationGas).toBeDefined()
    expect(userOperation_gas.callGasLimit).toBeGreaterThanOrEqual(10000n)
    expect(userOperation_gas.verificationGasLimit).toBeGreaterThanOrEqual(
      220000n,
    )
    expect(userOperation_gas.paymasterPostOpGasLimit).toBe(0n)
    expect(userOperation_gas.paymasterVerificationGasLimit).toBe(0n)
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
          isFinal: true,
          sponsor: { name: 'Viem' },
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

  const result = await getPaymasterStubData(paymasterClient, {
    callData: '0x',
    chainId: 1,
    entryPointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
    nonce: 0n,
    sender: '0x0000000000000000000000000000000000000003',
  })

  expect(result).toMatchInlineSnapshot(`
    {
      "isFinal": true,
      "paymaster": "0x0000000000000000000000000000000000000001",
      "paymasterData": "0xdeadbeef",
      "paymasterPostOpGasLimit": 1n,
      "paymasterVerificationGasLimit": 2n,
      "sponsor": {
        "name": "Viem",
      },
    }
  `)

  await server.close()
})
