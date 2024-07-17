import { beforeEach, describe, expect, test } from 'vitest'
import { wagmiContractConfig } from '../../../../test/src/abis.js'
import { anvilMainnet } from '../../../../test/src/anvil.js'
import { bundlerMainnet } from '../../../../test/src/bundler.js'
import { accounts } from '../../../../test/src/constants.js'
import {
  getSmartAccounts_06,
  getSmartAccounts_07,
} from '../../../../test/src/smartAccounts.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import {
  getBalance,
  mine,
  readContract,
  setBalance,
  writeContract,
} from '../../../actions/index.js'
import { sepolia } from '../../../chains/index.js'
import { createPublicClient } from '../../../clients/createPublicClient.js'
import { http } from '../../../clients/transports/http.js'
import { pad, parseEther, parseGwei } from '../../../utils/index.js'
import { toCoinbaseSmartAccount } from '../../accounts/implementations/toCoinbaseSmartAccount.js'
import { createBundlerClient } from '../../clients/createBundlerClient.js'
import { sendUserOperation } from './sendUserOperation.js'

const client = anvilMainnet.getClient({ account: true })
const bundlerClient = bundlerMainnet.getBundlerClient({ client })

const alice = accounts[7].address
const bob = accounts[8].address

const fees = {
  maxFeePerGas: parseGwei('15'),
  maxPriorityFeePerGas: parseGwei('2'),
} as const

beforeEach(async () => {
  await setBalance(client, { address: alice, value: parseEther('10000') })
  await setBalance(client, { address: bob, value: parseEther('10000') })
})

describe('entryPointVersion: 0.7', async () => {
  await bundlerMainnet.restart()

  const [account, account_2, account_3] = await getSmartAccounts_07()

  test('default', async () => {
    const hash = await sendUserOperation(bundlerClient, {
      account,
      calls: [
        {
          to: alice,
          value: parseEther('1'),
        },
        {
          to: bob,
          value: parseEther('2'),
        },
        {
          abi: wagmiContractConfig.abi,
          functionName: 'mint',
          to: wagmiContractConfig.address,
          args: [69420451n],
        },
      ],
      ...fees,
    })
    expect(hash).toBeDefined()

    await bundlerClient.request({ method: 'debug_bundler_sendBundleNow' })
    await mine(client, { blocks: 1 })

    expect(await getBalance(client, { address: alice })).toMatchInlineSnapshot(
      '10001000000000000000000n',
    )
    expect(await getBalance(client, { address: bob })).toMatchInlineSnapshot(
      '10002000000000000000000n',
    )
    expect(
      await readContract(client, {
        ...wagmiContractConfig,
        functionName: 'ownerOf',
        args: [69420451n],
      }),
    ).toBe(account.address)
  })

  test('error: no account', async () => {
    await expect(() =>
      // @ts-expect-error
      sendUserOperation(bundlerClient, {
        calls: [
          {
            to: '0x0000000000000000000000000000000000000000',
            value: parseEther('1'),
          },
        ],
        signature: '0xdeadbeef',
        ...fees,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [AccountNotFoundError: Could not find an Account to execute with this Action.
      Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the Client.

      Version: viem@x.y.z]
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
        callGasLimit:          0
        factory:               0xfb6dab6200b8958c2655c3747708f82243d3f32e
        factoryData:           0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000001
        maxFeePerGas:          15 gwei
        maxPriorityFeePerGas:  2 gwei
        nonce:                 0
        preVerificationGas:    0
        sender:                0x0b3D649C00208AFB6A40b4A7e918b84A52D783B8
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c
        verificationGasLimit:  0

      Details: UserOperation reverted during simulation with reason: AA10 sender already constructed
      Version: viem@x.y.z]
    `)
  })

  test('error: aa13', async () => {
    await expect(() =>
      sendUserOperation(bundlerClient, {
        account: account_3,
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
        callGasLimit:          0
        factory:               0x0000000000000000000000000000000000000000
        factoryData:           0xdeadbeef
        maxFeePerGas:          15 gwei
        maxPriorityFeePerGas:  2 gwei
        nonce:                 0
        preVerificationGas:    0
        sender:                0x274B2baeCC1A87493db36439Df3D8012855fB182
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c
        verificationGasLimit:  0

      Details: UserOperation reverted during simulation with reason: AA13 initCode failed or OOG
      Version: viem@x.y.z]
    `)
  })

  test('error: aa24', async () => {
    await expect(() =>
      sendUserOperation(bundlerClient, {
        account,
        calls: [
          {
            to: '0x0000000000000000000000000000000000000000',
            value: parseEther('1'),
          },
        ],
        signature: '0xdeadbeef',
        ...fees,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: Signature provided for the User Operation is invalid.

      This could arise when:
      - the \`signature\` for the User Operation is incorrectly computed, and unable to be verified by the Smart Account
       
      Request Arguments:
        callData:                       0xb61d27f600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000
        callGasLimit:                   80000
        maxFeePerGas:                   15 gwei
        maxPriorityFeePerGas:           2 gwei
        nonce:                          1
        paymasterPostOpGasLimit:        0
        paymasterVerificationGasLimit:  0
        preVerificationGas:             50692
        sender:                         0xE911628bF8428C23f179a07b081325cAe376DE1f
        signature:                      0xdeadbeef
        verificationGasLimit:           58357

      Details: UserOperation reverted with reason: AA24 signature error
      Version: viem@x.y.z]
    `)
  })
})

describe('entryPointVersion: 0.6', async () => {
  await bundlerMainnet.restart()

  const [account, account_2] = await getSmartAccounts_06()

  test('default', async () => {
    const hash = await sendUserOperation(bundlerClient, {
      account,
      calls: [
        {
          to: alice,
          value: parseEther('1'),
        },
        {
          to: bob,
          value: parseEther('2'),
        },
        {
          abi: wagmiContractConfig.abi,
          functionName: 'mint',
          to: wagmiContractConfig.address,
          args: [69420452n],
        },
      ],
      ...fees,
    })
    expect(hash).toBeDefined()

    await bundlerClient.request({ method: 'debug_bundler_sendBundleNow' })
    await mine(client, { blocks: 1 })

    expect(await getBalance(client, { address: alice })).toMatchInlineSnapshot(
      '10001000000000000000000n',
    )
    expect(await getBalance(client, { address: bob })).toMatchInlineSnapshot(
      '10002000000000000000000n',
    )
  })

  test('error: aa13', async () => {
    await expect(() =>
      sendUserOperation(bundlerClient, {
        account: account_2,
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
        callGasLimit:          0
        initCode:              0x0000000000000000000000000000000000000000deadbeef
        maxFeePerGas:          15 gwei
        maxPriorityFeePerGas:  2 gwei
        nonce:                 0
        paymasterAndData:      0x
        preVerificationGas:    0
        sender:                0x07B486204EC3d1ff6803614D3308945Fd45d580c
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c
        verificationGasLimit:  0

      Details: UserOperation reverted during simulation with reason: AA13 initCode failed or OOG
      Version: viem@x.y.z]
    `)
  })
})

test.skip('e2e', async () => {
  const client = createPublicClient({
    chain: sepolia,
    transport: http(process.env.VITE_ANVIL_FORK_URL_SEPOLIA),
  })

  const bundlerClient = createBundlerClient({
    chain: sepolia,
    client,
    transport: http(process.env.VITE_BUNDLER_URL_SEPOLIA),
  })

  const owner = privateKeyToAccount(
    process.env.VITE_ACCOUNT_PRIVATE_KEY! as `0x${string}`,
  )

  const account = await toCoinbaseSmartAccount({
    client,
    owners: [owner],
  })

  // Prefund account
  // const hash_send = await sendTransaction(client, {
  //   account: owner,
  //   to: account.address,
  //   value: parseEther('0.001'),
  // })
  // await waitForTransactionReceipt(client, { hash: hash_send })

  const hash = await bundlerClient.sendUserOperation({
    account,
    calls: [
      {
        abi: wagmiContractConfig.abi,
        to: '0xa3547d42ab27e8d4a7d04b4db960f346669f8701',
        functionName: 'mint',
      },
    ],
  })

  const receipt = await bundlerClient.waitForUserOperationReceipt({ hash })

  expect(receipt.success).toBe(true)
})
