import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  test,
  vi,
} from 'vitest'
import { wagmiContractConfig } from '../../../../test/src/abis.js'
import {
  createVerifyingPaymasterServer,
  getSmartAccounts_06,
  getSmartAccounts_07,
  getSmartAccounts_08,
  getVerifyingPaymaster_07,
} from '../../../../test/src/account-abstraction.js'
import { anvilMainnet } from '../../../../test/src/anvil.js'
import { bundlerMainnet } from '../../../../test/src/bundler.js'
import { accounts } from '../../../../test/src/constants.js'
import { privateKeyToAccount } from '../../../accounts/privateKeyToAccount.js'
import {
  getBalance,
  getTransactionCount,
  mine,
  readContract,
  reset,
  setBalance,
  writeContract,
} from '../../../actions/index.js'
import { sepolia } from '../../../chains/index.js'
import { createPublicClient } from '../../../clients/createPublicClient.js'
import { http } from '../../../clients/transports/http.js'
import { pad, parseEther, parseGwei } from '../../../utils/index.js'
import { toCoinbaseSmartAccount } from '../../accounts/implementations/toCoinbaseSmartAccount.js'
import { createBundlerClient } from '../../clients/createBundlerClient.js'
import { createPaymasterClient } from '../../clients/createPaymasterClient.js'
import type { UserOperation } from '../../types/userOperation.js'
import { prepareUserOperation } from './prepareUserOperation.js'
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
  await bundlerMainnet.restart()

  await setBalance(client, { address: alice, value: parseEther('10000') })
  await setBalance(client, { address: bob, value: parseEther('10000') })

  vi.useFakeTimers()
  vi.setSystemTime(new Date(Date.UTC(2023, 1, 1)))
  return () => vi.useRealTimers()
})

describe('entryPointVersion: 0.8', async () => {
  let account: Awaited<
    ReturnType<typeof getSmartAccounts_08>
  >[0]['smartAccount']
  let owner: Awaited<ReturnType<typeof getSmartAccounts_08>>[0]['owner']

  beforeAll(async () => {
    await reset(client, {
      blockNumber: 22239294n,
      jsonRpcUrl: anvilMainnet.forkUrl,
    })
    const accounts = await getSmartAccounts_08()
    account = accounts[0].smartAccount
    owner = accounts[0].owner
  })

  test('default', async () => {
    const authorization = await owner.signAuthorization({
      address: account.implementation,
      chainId: client.chain.id,
      nonce: await getTransactionCount(client, {
        address: owner.address,
      }),
    })
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
      authorization,
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

  // TODO: paymaster doesn't work as of now need to create new paymaster for entrypoint 0.8
  //   test('args: paymaster (client)', async () => {
  //     const paymaster = await getVerifyingPaymaster_07()
  //     const server = await createVerifyingPaymasterServer(client, { paymaster })

  //     const paymasterClient = createPaymasterClient({
  //       transport: http(server.url),
  //     })

  //     const hash = await sendUserOperation(bundlerClient, {
  //       account,
  //       calls: [
  //         {
  //           to: alice,
  //           value: parseEther('1'),
  //         },
  //         {
  //           to: bob,
  //           value: parseEther('2'),
  //         },
  //       ],
  //       paymaster: paymasterClient,
  //       ...fees,
  //     })
  //     expect(hash).toBeDefined()

  //     await bundlerClient.request({ method: 'debug_bundler_sendBundleNow' })
  //     await mine(client, { blocks: 1 })
  //   })

  //   // TODO: paymaster doesn't work as of now need to create new paymaster for entrypoint 0.8
  //   test('behavior: client.paymaster (client)', async () => {
  //     const paymaster = await getVerifyingPaymaster_07()
  //     const server = await createVerifyingPaymasterServer(client, { paymaster })

  //     const paymasterClient = createPaymasterClient({
  //       transport: http(server.url),
  //     })

  //     const bundlerClient = bundlerMainnet.getBundlerClient({
  //       client,
  //       paymaster: paymasterClient,
  //     })

  //     const hash = await sendUserOperation(bundlerClient, {
  //       account,
  //       calls: [
  //         {
  //           to: alice,
  //           value: parseEther('1'),
  //         },
  //         {
  //           to: bob,
  //           value: parseEther('2'),
  //         },
  //       ],
  //       ...fees,
  //     })
  //     expect(hash).toBeDefined()

  //     await bundlerClient.request({ method: 'debug_bundler_sendBundleNow' })
  //     await mine(client, { blocks: 1 })
  //   })

  test('behavior: prepared user operation', async () => {
    const request = {
      ...(await prepareUserOperation(bundlerClient, {
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
        ],
        ...fees,
      })),
      account: undefined,
    } as const
    const signature = await account.signUserOperation(request)

    expectTypeOf(request).toMatchTypeOf<UserOperation>()

    const hash = await sendUserOperation(bundlerClient, {
      ...request,
      entryPointAddress: account.entryPoint.address,
      signature,
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

  test('error: aa24', async () => {
    const authorization = await owner.signAuthorization({
      address: account.implementation,
      chainId: client.chain.id,
      nonce: await getTransactionCount(client, {
        address: owner.address,
      }),
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
        signature:
          '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c',
        callGasLimit: 80000n,
        verificationGasLimit: 79141n,
        authorization,
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
          nonce:                          30902162761058241966966132703232
          paymasterPostOpGasLimit:        0
          paymasterVerificationGasLimit:  0
          preVerificationGas:             91968
          sender:                         0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
          signature:                      0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c
          verificationGasLimit:           79141

        Details: UserOperation reverted with reason: AA24 signature error
        Version: viem@x.y.z]
      `)
  })
})

describe('entryPointVersion: 0.7', async () => {
  let account: Awaited<ReturnType<typeof getSmartAccounts_07>>[0]
  let account_2: Awaited<ReturnType<typeof getSmartAccounts_07>>[0]
  let account_3: Awaited<ReturnType<typeof getSmartAccounts_07>>[0]

  beforeAll(async () => {
    await reset(client, {
      blockNumber: 22239294n,
      jsonRpcUrl: anvilMainnet.forkUrl,
    })
    const accounts = await getSmartAccounts_07()
    account = accounts[0]
    account_2 = accounts[1]
    account_3 = accounts[2]
  })

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

  test('args: paymaster (client)', async () => {
    const paymaster = await getVerifyingPaymaster_07()
    const server = await createVerifyingPaymasterServer(client, { paymaster })

    const paymasterClient = createPaymasterClient({
      transport: http(server.url),
    })

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
      ],
      paymaster: paymasterClient,
      ...fees,
    })
    expect(hash).toBeDefined()

    await bundlerClient.request({ method: 'debug_bundler_sendBundleNow' })
    await mine(client, { blocks: 1 })
  })

  test('behavior: client.paymaster (client)', async () => {
    const paymaster = await getVerifyingPaymaster_07()
    const server = await createVerifyingPaymasterServer(client, { paymaster })

    const paymasterClient = createPaymasterClient({
      transport: http(server.url),
    })

    const bundlerClient = bundlerMainnet.getBundlerClient({
      client,
      paymaster: paymasterClient,
    })

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
      ],
      ...fees,
    })
    expect(hash).toBeDefined()

    await bundlerClient.request({ method: 'debug_bundler_sendBundleNow' })
    await mine(client, { blocks: 1 })
  })

  test('behavior: prepared user operation', async () => {
    const request = {
      ...(await prepareUserOperation(bundlerClient, {
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
        ],
        ...fees,
      })),
      account: undefined,
    } as const
    const signature = await account.signUserOperation(request)

    expectTypeOf(request).toMatchTypeOf<UserOperation>()

    const hash = await sendUserOperation(bundlerClient, {
      ...request,
      entryPointAddress: account.entryPoint.address,
      signature,
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
        factory:               0x74ce26a2e4c1368c48a0157ce762944d282896db
        factoryData:           0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000001
        maxFeePerGas:          15 gwei
        maxPriorityFeePerGas:  2 gwei
        nonce:                 30902162761021348478818713600000
        preVerificationGas:    0
        sender:                0xB600766167E4186c9Ee74eEA1B02aA845BDE7069
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
        nonce:                 30902162761021348478818713600000
        preVerificationGas:    0
        sender:                0x89B092309A96DAE4c9D59728b427DB60d5b2e274
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
        callGasLimit: 80000n,
        verificationGasLimit: 79141n,
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
        nonce:                          30902162761095135455113551806464
        paymasterPostOpGasLimit:        0
        paymasterVerificationGasLimit:  0
        preVerificationGas:             48527
        sender:                         0xB7736b6eFedB1E7103F403122e35f2F015dE01c2
        signature:                      0xdeadbeef
        verificationGasLimit:           79141

      Details: UserOperation reverted with reason: AA24 signature error
      Version: viem@x.y.z]
    `)
  })
})

describe('entryPointVersion: 0.6', async () => {
  let account: Awaited<ReturnType<typeof getSmartAccounts_06>>[0]
  let account_2: Awaited<ReturnType<typeof getSmartAccounts_06>>[0]

  beforeAll(async () => {
    await reset(client, {
      blockNumber: 22239294n,
      jsonRpcUrl: anvilMainnet.forkUrl,
    })
    const accounts = await getSmartAccounts_06()
    account = accounts[0]
    account_2 = accounts[1]
  })

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
        nonce:                 30902162761021348478818713600000
        paymasterAndData:      0x
        preVerificationGas:    0
        sender:                0xB600766167E4186c9Ee74eEA1B02aA845BDE7069
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c
        verificationGasLimit:  0

      Details: UserOperation reverted during simulation with reason: AA13 initCode failed or OOG
      Version: viem@x.y.z]
    `)
  })
})

test.skip('e2e', async () => {
  vi.useRealTimers()

  const client = createPublicClient({
    chain: sepolia,
    transport: http(process.env.VITE_ANVIL_FORK_URL_SEPOLIA),
  })

  // const paymasterClient = createPaymasterClient({
  //   transport: http(process.env.VITE_PAYMASTER_URL),
  // })

  const bundlerClient = createBundlerClient({
    chain: sepolia,
    client,
    // paymaster: paymasterClient,
    transport: http(process.env.VITE_BUNDLER_URL_SEPOLIA),
  })

  const owner = privateKeyToAccount(
    process.env.VITE_ACCOUNT_PRIVATE_KEY! as `0x${string}`,
  )

  const account = await toCoinbaseSmartAccount({
    client,
    owners: [owner],
  })
  // const account = await toSoladySmartAccount({
  //   client,
  //   owner,
  // })

  // Prefund account
  // const hash_send = await sendTransaction(client, {
  //   account: owner,
  //   to: account.address,
  //   value: parseEther('0.001'),
  // })
  // await waitForTransactionReceipt(client, { hash: hash_send })

  const [hash, hash_2] = await Promise.all([
    bundlerClient.sendUserOperation({
      account,
      calls: [
        {
          abi: wagmiContractConfig.abi,
          to: '0xa3547d42ab27e8d4a7d04b4db960f346669f8701',
          functionName: 'mint',
        },
      ],
    }),
    bundlerClient.sendUserOperation({
      account,
      calls: [
        {
          abi: wagmiContractConfig.abi,
          to: '0xa3547d42ab27e8d4a7d04b4db960f346669f8701',
          functionName: 'mint',
        },
      ],
    }),
  ])

  const receipt = await bundlerClient.waitForUserOperationReceipt({ hash })
  const receipt_2 = await bundlerClient.waitForUserOperationReceipt({
    hash: hash_2,
  })

  expect(receipt.success).toBe(true)
  expect(receipt_2.success).toBe(true)
})
