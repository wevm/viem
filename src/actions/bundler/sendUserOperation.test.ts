import { describe, expect, test } from 'vitest'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { bundlerMainnet } from '../../../test/src/bundler.js'
import { accounts } from '../../../test/src/constants.js'
import {
  getSmartAccounts_06,
  getSmartAccounts_07,
} from '../../../test/src/smartAccounts.js'
import { mine, writeContract } from '../../actions/index.js'
import { pad, parseEther, parseGwei } from '../../utils/index.js'
import { sendUserOperation } from './sendUserOperation.js'

const client = anvilMainnet.getClient({ account: true })
const bundlerClient = bundlerMainnet.getBundlerClient()

const fees = {
  maxFeePerGas: parseGwei('7'),
  maxPriorityFeePerGas: parseGwei('1'),
} as const

describe('entryPointVersion: 0.7', async () => {
  const [account, account_2, account_3] = await getSmartAccounts_07()

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

  test('error: aa10', async () => {
    const { factory, factoryData } = await account_2.getFactoryArgs()

    await writeContract(client, {
      account: accounts[0].address,
      abi: account_2.factory.abi,
      address: account_2.factory.address,
      functionName: 'createAccount',
      args: [accounts[0].address, pad('0x1')],
    })
    await mine(client, {
      blocks: 1,
    })

    await expect(() =>
      sendUserOperation(bundlerClient, {
        account: account_2,
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
        factory,
        factoryData,
        ...fees,
      }),
    ).rejects.toMatchInlineSnapshot(`
      [UserOperationExecutionError: Smart Account has already been deployed.

      Remove the following properties and try again:
      \`factory\`
      \`factoryData\`
       
      Request Arguments:
        callData:              0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000
        factory:               0xfb6dab6200b8958c2655c3747708f82243d3f32e
        factoryData:           0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000001
        maxFeePerGas:          7 gwei
        maxPriorityFeePerGas:  1 gwei
        nonce:                 0
        sender:                0x0b3D649C00208AFB6A40b4A7e918b84A52D783B8
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Details: UserOperation reverted during simulation with reason: AA10 sender already constructed
      Version: viem@x.y.z]
    `)
  })

  test('error: aa13', async () => {
    await writeContract(client, {
      abi: account.abi,
      address: account.address,
      functionName: 'addDeposit',
      value: parseEther('1'),
    })
    await mine(client, {
      blocks: 1,
    })

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

      This could arise when:
      - Invalid \`factory\`/\`factoryData\` or \`initCode\` properties are present
      - Smart Account deployment execution ran out of gas (low \`verificationGasLimit\` value)
      - Smart Account deployment execution reverted with an error

      factory: 0x0000000000000000000000000000000000000000
      factoryData: 0xdeadbeef
       
      Request Arguments:
        callData:              0xb61d27f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000
        factory:               0x0000000000000000000000000000000000000000
        factoryData:           0xdeadbeef
        maxFeePerGas:          7 gwei
        maxPriorityFeePerGas:  1 gwei
        nonce:                 0
        sender:                0xE911628bF8428C23f179a07b081325cAe376DE1f
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Details: UserOperation reverted during simulation with reason: AA13 initCode failed or OOG
      Version: viem@x.y.z]
    `)
  })

  test('error: aa14', async () => {
    const { factory, factoryData } = await account_3.getFactoryArgs()

    await writeContract(client, {
      account: accounts[0].address,
      abi: account_3.factory.abi,
      address: account_3.factory.address,
      functionName: 'createAccount',
      args: [accounts[0].address, pad('0x1')],
    })
    await mine(client, {
      blocks: 1,
    })

    await expect(() =>
      sendUserOperation(bundlerClient, {
        account,
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
        factory,
        factoryData,
        ...fees,
      }),
    ).rejects.toMatchInlineSnapshot(`
      [UserOperationExecutionError: Smart Account initialization implementation does not return the expected sender.

      This could arise when:
      Smart Account initialization implementation does not return a sender address

      factory: 0xfb6dab6200b8958c2655c3747708f82243d3f32e
      factoryData: 0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000002
      sender: 0xE911628bF8428C23f179a07b081325cAe376DE1f
       
      Request Arguments:
        callData:              0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000
        factory:               0xfb6dab6200b8958c2655c3747708f82243d3f32e
        factoryData:           0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000002
        maxFeePerGas:          7 gwei
        maxPriorityFeePerGas:  1 gwei
        nonce:                 0
        sender:                0xE911628bF8428C23f179a07b081325cAe376DE1f
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Details: UserOperation reverted during simulation with reason: AA14 initCode must return sender
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

  test('error: aa13', async () => {
    await writeContract(client, {
      abi: account.abi,
      address: account.address,
      functionName: 'addDeposit',
      value: parseEther('1'),
    })
    await mine(client, {
      blocks: 1,
    })

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

      This could arise when:
      - Invalid \`factory\`/\`factoryData\` or \`initCode\` properties are present
      - Smart Account deployment execution ran out of gas (low \`verificationGasLimit\` value)
      - Smart Account deployment execution reverted with an error

      initCode: 0x0000000000000000000000000000000000000000deadbeef
       
      Request Arguments:
        callData:              0xb61d27f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000
        initCode:              0x0000000000000000000000000000000000000000deadbeef
        maxFeePerGas:          7 gwei
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
