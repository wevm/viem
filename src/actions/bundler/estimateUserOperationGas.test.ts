import { describe, expect, test } from 'vitest'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { bundlerMainnet } from '../../../test/src/bundler.js'
import { accounts } from '../../../test/src/constants.js'
import {
  getSmartAccounts_06,
  getSmartAccounts_07,
} from '../../../test/src/smartAccounts.js'
import { mine, writeContract } from '../../actions/index.js'
import { pad } from '../../utils/index.js'
import { estimateUserOperationGas } from './estimateUserOperationGas.js'

const client = anvilMainnet.getClient()
const bundlerClient = bundlerMainnet.getBundlerClient()

describe('entryPointVersion: 0.7', async () => {
  const [account, account_2, account_3] = await getSmartAccounts_07()

  test('default', async () => {
    expect(
      await estimateUserOperationGas(bundlerClient, {
        account,
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      }),
    ).toMatchInlineSnapshot(`
      {
        "callGasLimit": 80000n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 51642n,
        "verificationGasLimit": 259060n,
      }
    `)
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
      estimateUserOperationGas(bundlerClient, {
        account: account_2,
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
        factory,
        factoryData,
      }),
    ).rejects.toMatchInlineSnapshot(`
      [UserOperationExecutionError: Smart Account has already been deployed.

      Remove the following properties and try again:
      \`factory\`
      \`factoryData\`
       
      Request Arguments:
        callData:     0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000
        factory:      0xfb6dab6200b8958c2655c3747708f82243d3f32e
        factoryData:  0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000001
        nonce:        0
        sender:       0x0b3D649C00208AFB6A40b4A7e918b84A52D783B8
        signature:    0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Details: UserOperation reverted during simulation with reason: AA10 sender already constructed
      Version: viem@x.y.z]
    `)
  })

  test('error: aa13', async () => {
    await expect(() =>
      estimateUserOperationGas(bundlerClient, {
        account,
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
        factory: '0x0000000000000000000000000000000000000000',
        factoryData: '0x',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: Failed to simulate deployment for Smart Account.

      This could arise when:
      - Invalid \`factory\`/\`factoryData\` or \`initCode\` properties are present
      - Smart Account deployment execution ran out of gas (low \`verificationGasLimit\` value)
      - Smart Account deployment execution reverted with an error

      factory: 0x0000000000000000000000000000000000000000
      factoryData: 0x
       
      Request Arguments:
        callData:     0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000
        factory:      0x0000000000000000000000000000000000000000
        factoryData:  0x
        nonce:        0
        sender:       0xE911628bF8428C23f179a07b081325cAe376DE1f
        signature:    0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

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
      estimateUserOperationGas(bundlerClient, {
        account,
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
        factory,
        factoryData,
      }),
    ).rejects.toMatchInlineSnapshot(`
      [UserOperationExecutionError: Smart Account initialization implementation does not return the expected sender.

      This could arise when:
      Smart Account initialization implementation does not return a sender address

      factory: 0xfb6dab6200b8958c2655c3747708f82243d3f32e
      factoryData: 0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000002
      sender: 0xE911628bF8428C23f179a07b081325cAe376DE1f
       
      Request Arguments:
        callData:     0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000
        factory:      0xfb6dab6200b8958c2655c3747708f82243d3f32e
        factoryData:  0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000002
        nonce:        0
        sender:       0xE911628bF8428C23f179a07b081325cAe376DE1f
        signature:    0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Details: UserOperation reverted during simulation with reason: AA14 initCode must return sender
      Version: viem@x.y.z]
    `)
  })
})

describe('entryPointVersion: 0.6', async () => {
  const [account] = await getSmartAccounts_06()

  test('default', async () => {
    expect(
      await estimateUserOperationGas(bundlerClient, {
        account,
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      }),
    ).toMatchInlineSnapshot(`
      {
        "callGasLimit": 80000n,
        "preVerificationGas": 55154n,
        "verificationGasLimit": 258801n,
      }
    `)
  })

  test('error: aa13', async () => {
    await expect(() =>
      estimateUserOperationGas(bundlerClient, {
        account,
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
        initCode: '0x0000000000000000000000000000000000000000deadbeef',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: Failed to simulate deployment for Smart Account.

      This could arise when:
      - Invalid \`factory\`/\`factoryData\` or \`initCode\` properties are present
      - Smart Account deployment execution ran out of gas (low \`verificationGasLimit\` value)
      - Smart Account deployment execution reverted with an error

      initCode: 0x0000000000000000000000000000000000000000deadbeef
       
      Request Arguments:
        callData:          0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000
        initCode:          0x0000000000000000000000000000000000000000deadbeef
        nonce:             0
        paymasterAndData:  0x
        sender:            0x6edf7db791fC4D438D4A683E857B2fE1a84947Ce
        signature:         0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Details: UserOperation reverted during simulation with reason: AA13 initCode failed or OOG
      Version: viem@x.y.z]
    `)
  })
})

test('error: account not defined', async () => {
  await expect(() =>
    estimateUserOperationGas(bundlerClient, {
      // @ts-expect-error
      account: undefined,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [AccountNotFoundError: Could not find an Account to execute with this Action.
    Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the Client.

    Version: viem@x.y.z]
  `)
})
