import { describe, expect, test } from 'vitest'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { bundlerMainnet } from '../../../test/src/bundler.js'
import {
  getSmartAccounts_06,
  getSmartAccounts_07,
} from '../../../test/src/smartAccounts.js'
import { estimateFeesPerGas, mine, writeContract } from '../../actions/index.js'
import { parseEther } from '../../utils/index.js'
import { sendUserOperation } from './sendUserOperation.js'

const client = anvilMainnet.getClient({ account: true })
const bundlerClient = bundlerMainnet.getBundlerClient()

describe('entryPointVersion: 0.7', async () => {
  const [account] = await getSmartAccounts_07()

  test('default', async () => {
    await writeContract(client, {
      abi: account.abi,
      address: account.address,
      functionName: 'addDeposit',
      value: parseEther('1'),
    })
    await mine(client, {
      blocks: 1,
    })

    const fees = await estimateFeesPerGas(client)

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

    expect(hash).toBeDefined()
  })

  test('error: failed init code', async () => {
    await writeContract(client, {
      abi: account.abi,
      address: account.address,
      functionName: 'addDeposit',
      value: parseEther('1'),
    })
    await mine(client, {
      blocks: 1,
    })

    const fees = await estimateFeesPerGas(client)

    await expect(() =>
      sendUserOperation(bundlerClient, {
        account,
        calls: [
          {
            to: '0x0000000000000000000000000000000000000000',
            value: parseEther('1'),
          },
        ],
        factory: '0x0000000000000000000000000000000000000000',
        factoryData: '0xdeadbeef',
        ...fees,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: Failed to simulate deployment for Smart Account.

      factory: 0x0000000000000000000000000000000000000000
      factoryData: 0xdeadbeef
       
      Request Arguments:
        callData:              0xb61d27f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000
        factory:               0x0000000000000000000000000000000000000000
        factoryData:           0xdeadbeef
        maxFeePerGas:          6.480957812 gwei
        maxPriorityFeePerGas:  1 gwei
        nonce:                 0
        sender:                0xE911628bF8428C23f179a07b081325cAe376DE1f
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Details: UserOperation reverted during simulation with reason: AA13 initCode failed or OOG
      Version: viem@x.y.z]
    `)
  })
})

describe('entryPointVersion: 0.6', async () => {
  const [account] = await getSmartAccounts_06()

  test('default', async () => {
    await writeContract(client, {
      abi: account.abi,
      address: account.address,
      functionName: 'addDeposit',
      value: parseEther('1'),
    })
    await mine(client, {
      blocks: 1,
    })

    const fees = await estimateFeesPerGas(client)

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

    expect(hash).toBeDefined()
  })

  test('error: failed init code', async () => {
    await writeContract(client, {
      abi: account.abi,
      address: account.address,
      functionName: 'addDeposit',
      value: parseEther('1'),
    })
    await mine(client, {
      blocks: 1,
    })

    const fees = await estimateFeesPerGas(client)

    await expect(() =>
      sendUserOperation(bundlerClient, {
        account,
        calls: [
          {
            to: '0x0000000000000000000000000000000000000000',
            value: parseEther('1'),
          },
        ],
        initCode: '0x0000000000000000000000000000000000000000deadbeef',
        ...fees,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: Failed to simulate deployment for Smart Account.

      initCode: 0x0000000000000000000000000000000000000000deadbeef
       
      Request Arguments:
        callData:              0xb61d27f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000
        initCode:              0x0000000000000000000000000000000000000000deadbeef
        maxFeePerGas:          5.198042154 gwei
        maxPriorityFeePerGas:  1 gwei
        nonce:                 0
        paymasterAndData:      0x
        sender:                0x6edf7db791fC4D438D4A683E857B2fE1a84947Ce
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Details: UserOperation reverted during simulation with reason: AA13 initCode failed or OOG
      Version: viem@x.y.z]
    `)
  })
})
