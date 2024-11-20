import { describe, expect, test } from 'vitest'
import {
  createVerifyingPaymasterServer,
  getSmartAccounts_07,
  getVerifyingPaymaster_07,
} from '../../../../test/src/account-abstraction.js'
import { anvilMainnet } from '../../../../test/src/anvil.js'
import { bundlerMainnet } from '../../../../test/src/bundler.js'
import { mine } from '../../../actions/index.js'
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

    expect(userOperation_gas.callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(userOperation_gas.preVerificationGas).toBeGreaterThanOrEqual(100000n)
    expect(userOperation_gas.verificationGasLimit).toBeGreaterThanOrEqual(
      259000n,
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
