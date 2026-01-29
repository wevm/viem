import { beforeEach, describe, expect, expectTypeOf, test, vi } from 'vitest'
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
import { deployErrorExample } from '~test/utils.js'
import { ErrorsExample } from '../../../../contracts/generated.js'
import { mine, writeContract } from '../../../actions/index.js'
import { http } from '../../../clients/transports/http.js'
import { pad, parseEther, parseGwei } from '../../../utils/index.js'
import { createPaymasterClient } from '../../clients/createPaymasterClient.js'
import type { UserOperation } from '../../types/userOperation.js'
import { estimateUserOperationGas } from './estimateUserOperationGas.js'
import { prepareUserOperation } from './prepareUserOperation.js'

const client = anvilMainnet.getClient({ account: true })
const bundlerClient = bundlerMainnet.getBundlerClient()

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
    const gas = await estimateUserOperationGas(bundlerClient, {
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
    expect(gas.callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(gas.preVerificationGas).toBeGreaterThanOrEqual(53000n)
    expect(gas.verificationGasLimit).toBeGreaterThanOrEqual(95000n)
  })

  test('args: paymaster (client)', async () => {
    const paymaster = await getVerifyingPaymaster_08()
    const server = await createVerifyingPaymasterServer(client, { paymaster })

    const paymasterClient = createPaymasterClient({
      transport: http(server.url),
    })

    const gas = await estimateUserOperationGas(bundlerClient, {
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

    expect(gas.callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(gas.preVerificationGas).toBeGreaterThanOrEqual(53000n)
    expect(gas.verificationGasLimit).toBeGreaterThanOrEqual(50000n)
    expect(gas.paymasterVerificationGasLimit).toBeGreaterThanOrEqual(20000n)
    expect(gas.paymasterPostOpGasLimit).toBeGreaterThanOrEqual(0n)
  })

  test('behavior: client.paymaster (client)', async () => {
    const paymaster = await getVerifyingPaymaster_08()
    const server = await createVerifyingPaymasterServer(client, { paymaster })

    const paymasterClient = createPaymasterClient({
      transport: http(server.url),
    })

    const bundlerClient = bundlerMainnet.getBundlerClient({
      paymaster: paymasterClient,
    })

    const gas = await estimateUserOperationGas(bundlerClient, {
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

    expect(gas.callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(gas.preVerificationGas).toBeGreaterThanOrEqual(59000n)
    expect(gas.verificationGasLimit).toBeGreaterThanOrEqual(50000n)
    expect(gas.paymasterVerificationGasLimit).toBeGreaterThanOrEqual(20000n)
    expect(gas.paymasterPostOpGasLimit).toBeGreaterThanOrEqual(0n)
  })

  test('behavior: prepared user operation', async () => {
    const userOp = await prepareUserOperation(bundlerClient, {
      account,
      calls: [
        {
          to: '0x0000000000000000000000000000000000000000',
          value: parseEther('1'),
        },
      ],
      ...fees,
    })

    const request = {
      ...userOp,
      account: undefined,
    } as const

    expectTypeOf(request).toMatchTypeOf<UserOperation>()

    const gas = await estimateUserOperationGas(bundlerClient, {
      ...request,
      entryPointAddress: account.entryPoint?.address,
    })

    expect(gas.callGasLimit).toBeGreaterThanOrEqual(16000n)
    expect(gas.preVerificationGas).toBeGreaterThanOrEqual(51000n)
    expect(gas.verificationGasLimit).toBeGreaterThanOrEqual(95000n)
    expect(gas.paymasterVerificationGasLimit).toBeGreaterThanOrEqual(0n)
    expect(gas.paymasterPostOpGasLimit).toBeGreaterThanOrEqual(0n)
  })

  test('error: insufficient funds', async () => {
    await expect(async () =>
      estimateUserOperationGas(bundlerClient, {
        account,
        calls: [
          {
            to: '0x0000000000000000000000000000000000000000',
            value: parseEther('1000000'),
          },
        ],
        ...fees,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: Execution reverted with reason: UserOperation reverted during simulation with reason: 0x.

      Request Arguments:
        callData:              0xb61d27f6000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d3c21bcecceda100000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000
        factory:               0x7702
        factoryData:           0x
        maxFeePerGas:          15 gwei
        maxPriorityFeePerGas:  2 gwei
        nonce:                 30902162761095135455113551806464
        sender:                0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Details: UserOperation reverted during simulation with reason: 0x
      Version: viem@x.y.z]
    `)
  })

  test('error: contract revert', async () => {
    await expect(async () =>
      estimateUserOperationGas(bundlerClient, {
        account,
        calls: [
          {
            to: wagmiContractConfig.address,
            abi: wagmiContractConfig.abi,
            functionName: 'mint',
            args: [420n],
          },
        ],
        ...fees,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: The contract function "mint" reverted with the following reason:
      Token ID is taken

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  mint(uint256 tokenId)
        args:          (420)
       
      Request Arguments:
        callData:              0xb61d27f6000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c2000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000024a0712d6800000000000000000000000000000000000000000000000000000000000001a400000000000000000000000000000000000000000000000000000000
        factory:               0x7702
        factoryData:           0x
        maxFeePerGas:          15 gwei
        maxPriorityFeePerGas:  2 gwei
        nonce:                 30902162761113582199187261358080
        sender:                0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Version: viem@x.y.z]
    `)
  })

  test('error: contract revert', async () => {
    await expect(async () =>
      estimateUserOperationGas(bundlerClient, {
        account,
        calls: [
          {
            to: wagmiContractConfig.address,
            abi: wagmiContractConfig.abi,
            functionName: 'approve',
            args: ['0x0000000000000000000000000000000000000000', 420n],
          },
        ],
        ...fees,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: The contract function "approve" reverted with the following reason:
      ERC721: approve caller is not owner nor approved for all

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  approve(address to, uint256 tokenId)
        args:             (0x0000000000000000000000000000000000000000, 420)
       
      Request Arguments:
        callData:              0xb61d27f6000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c2000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044095ea7b3000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001a400000000000000000000000000000000000000000000000000000000
        factory:               0x7702
        factoryData:           0x
        maxFeePerGas:          15 gwei
        maxPriorityFeePerGas:  2 gwei
        nonce:                 30902162761132028943260970909696
        sender:                0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Version: viem@x.y.z]
    `)
  })

  test('error: contract revert (multiple calls)', async () => {
    await expect(async () =>
      estimateUserOperationGas(bundlerClient, {
        account,
        calls: [
          {
            to: wagmiContractConfig.address,
            abi: wagmiContractConfig.abi,
            functionName: 'mint',
          },
          {
            to: wagmiContractConfig.address,
            abi: wagmiContractConfig.abi,
            functionName: 'approve',
            args: ['0x0000000000000000000000000000000000000000', 420n],
          },
        ],
        ...fees,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: The contract function "mint | approve" reverted with the following signature:
      0x5a154675

      Unable to decode signature "0x5a154675" as it was not found on the provided ABI.
      Make sure you are using the correct ABI and that the error exists on it.
      You can look up the decoded signature here: https://openchain.xyz/signatures?query=0x5a154675.
       
       
      Request Arguments:
        callData:              0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c2000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044095ea7b3000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001a400000000000000000000000000000000000000000000000000000000
        factory:               0x7702
        factoryData:           0x
        maxFeePerGas:          15 gwei
        maxPriorityFeePerGas:  2 gwei
        nonce:                 30902162761150475687334680461312
        sender:                0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Docs: https://viem.sh/docs/contract/decodeErrorResult
      Version: viem@x.y.z]
    `)
  })

  test('error: function does not exist', async () => {
    await expect(async () =>
      estimateUserOperationGas(bundlerClient, {
        account,
        calls: [
          {
            // 7702 implementation has a fallback so sending it to uniswap factory instead
            to: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
            abi: wagmiContractConfig.abi,
            functionName: 'mint',
            args: [420n],
          },
        ],
        ...fees,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: The contract function "mint" returned no data ("0x").

      This could be due to any of the following:
        - The contract does not have the function "mint",
        - The parameters passed to the contract function may be invalid, or
        - The address is not a contract.
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  mint(uint256 tokenId)
        args:          (420)
       
      Request Arguments:
        callData:              0xb61d27f60000000000000000000000005c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000024a0712d6800000000000000000000000000000000000000000000000000000000000001a400000000000000000000000000000000000000000000000000000000
        factory:               0x7702
        factoryData:           0x
        maxFeePerGas:          15 gwei
        maxPriorityFeePerGas:  2 gwei
        nonce:                 30902162761168922431408390012928
        sender:                0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Version: viem@x.y.z]
    `)
  })

  test('error: generic revert', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(async () =>
      estimateUserOperationGas(bundlerClient, {
        account,
        calls: [
          {
            to: '0x0000000000000000000000000000000000000000',
            value: parseEther('1'),
          },
          {
            abi: ErrorsExample.abi,
            to: contractAddress!,
            functionName: 'revertWrite',
          },
        ],
        ...fees,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: The contract function "revertWrite" reverted with the following signature:
      0x5a154675

      Unable to decode signature "0x5a154675" as it was not found on the provided ABI.
      Make sure you are using the correct ABI and that the error exists on it.
      You can look up the decoded signature here: https://openchain.xyz/signatures?query=0x5a154675.
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  revertWrite()
       
      Request Arguments:
        callData:              0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c63db9682ff11707cadbd72bf1a0354a7fef143b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004940b880200000000000000000000000000000000000000000000000000000000
        factory:               0x7702
        factoryData:           0x
        maxFeePerGas:          15 gwei
        maxPriorityFeePerGas:  2 gwei
        nonce:                 30902162761187369175482099564544
        sender:                0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Docs: https://viem.sh/docs/contract/decodeErrorResult
      Version: viem@x.y.z]
    `)
  })

  test('error: assert', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(async () =>
      estimateUserOperationGas(bundlerClient, {
        account,
        calls: [
          {
            to: '0x0000000000000000000000000000000000000000',
            value: parseEther('1'),
          },
          {
            abi: ErrorsExample.abi,
            to: contractAddress!,
            functionName: 'assertWrite',
          },
        ],
        ...fees,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: The contract function "assertWrite" reverted with the following signature:
      0x5a154675

      Unable to decode signature "0x5a154675" as it was not found on the provided ABI.
      Make sure you are using the correct ABI and that the error exists on it.
      You can look up the decoded signature here: https://openchain.xyz/signatures?query=0x5a154675.
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  assertWrite()
       
      Request Arguments:
        callData:              0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fc3983de3f7cbe1ba01084469779470ad0bbeffa0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000040469615200000000000000000000000000000000000000000000000000000000
        factory:               0x7702
        factoryData:           0x
        maxFeePerGas:          15 gwei
        maxPriorityFeePerGas:  2 gwei
        nonce:                 30902162761205815919555809116160
        sender:                0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Docs: https://viem.sh/docs/contract/decodeErrorResult
      Version: viem@x.y.z]
    `)
  })

  test('error: overflow', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(async () =>
      estimateUserOperationGas(bundlerClient, {
        account,
        calls: [
          {
            to: '0x0000000000000000000000000000000000000000',
            value: parseEther('1'),
          },
          {
            abi: ErrorsExample.abi,
            to: contractAddress!,
            functionName: 'overflowWrite',
          },
        ],
        ...fees,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: The contract function "overflowWrite" reverted with the following signature:
      0x5a154675

      Unable to decode signature "0x5a154675" as it was not found on the provided ABI.
      Make sure you are using the correct ABI and that the error exists on it.
      You can look up the decoded signature here: https://openchain.xyz/signatures?query=0x5a154675.
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  overflowWrite()
       
      Request Arguments:
        callData:              0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f8b1d4d0a2dd9dd53200a4c6783a69c15e3a25f4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004d44de86600000000000000000000000000000000000000000000000000000000
        factory:               0x7702
        factoryData:           0x
        maxFeePerGas:          15 gwei
        maxPriorityFeePerGas:  2 gwei
        nonce:                 30902162761224262663629518667776
        sender:                0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Docs: https://viem.sh/docs/contract/decodeErrorResult
      Version: viem@x.y.z]
    `)
  })

  test('error: divide by zero', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(async () =>
      estimateUserOperationGas(bundlerClient, {
        account,
        calls: [
          {
            to: '0x0000000000000000000000000000000000000000',
            value: parseEther('1'),
          },
          {
            abi: ErrorsExample.abi,
            to: contractAddress!,
            functionName: 'divideByZeroWrite',
          },
        ],
        ...fees,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: The contract function "divideByZeroWrite" reverted with the following signature:
      0x5a154675

      Unable to decode signature "0x5a154675" as it was not found on the provided ABI.
      Make sure you are using the correct ABI and that the error exists on it.
      You can look up the decoded signature here: https://openchain.xyz/signatures?query=0x5a154675.
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  divideByZeroWrite()
       
      Request Arguments:
        callData:              0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d6b8eb34413f07a1a67a469345cfea6633efd58d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004c66cf13300000000000000000000000000000000000000000000000000000000
        factory:               0x7702
        factoryData:           0x
        maxFeePerGas:          15 gwei
        maxPriorityFeePerGas:  2 gwei
        nonce:                 30902162761242709407703228219392
        sender:                0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Docs: https://viem.sh/docs/contract/decodeErrorResult
      Version: viem@x.y.z]
    `)
  })

  test('error: custom error', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(async () =>
      estimateUserOperationGas(bundlerClient, {
        account,
        calls: [
          {
            to: '0x0000000000000000000000000000000000000000',
            value: parseEther('1'),
          },
          {
            abi: ErrorsExample.abi,
            to: contractAddress!,
            functionName: 'simpleCustomWrite',
          },
        ],
        ...fees,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: The contract function "simpleCustomWrite" reverted with the following signature:
      0x5a154675

      Unable to decode signature "0x5a154675" as it was not found on the provided ABI.
      Make sure you are using the correct ABI and that the error exists on it.
      You can look up the decoded signature here: https://openchain.xyz/signatures?query=0x5a154675.
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  simpleCustomWrite()
       
      Request Arguments:
        callData:              0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009cc87998ba85d81e017e6b7662ac00ee2ab8fe13000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004a997732e00000000000000000000000000000000000000000000000000000000
        factory:               0x7702
        factoryData:           0x
        maxFeePerGas:          15 gwei
        maxPriorityFeePerGas:  2 gwei
        nonce:                 30902162761261156151776937771008
        sender:                0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Docs: https://viem.sh/docs/contract/decodeErrorResult
      Version: viem@x.y.z]
    `)
  })

  test('error: custom error', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(async () =>
      estimateUserOperationGas(bundlerClient, {
        account,
        calls: [
          {
            to: '0x0000000000000000000000000000000000000000',
            value: parseEther('1'),
          },
          {
            abi: ErrorsExample.abi,
            to: contractAddress!,
            functionName: 'complexCustomWrite',
          },
        ],
        ...fees,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: The contract function "complexCustomWrite" reverted with the following signature:
      0x5a154675

      Unable to decode signature "0x5a154675" as it was not found on the provided ABI.
      Make sure you are using the correct ABI and that the error exists on it.
      You can look up the decoded signature here: https://openchain.xyz/signatures?query=0x5a154675.
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  complexCustomWrite()
       
      Request Arguments:
        callData:              0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000b1fc11f03b084fff8dae95fa08e8d69ad2547ec10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000048de18b9100000000000000000000000000000000000000000000000000000000
        factory:               0x7702
        factoryData:           0x
        maxFeePerGas:          15 gwei
        maxPriorityFeePerGas:  2 gwei
        nonce:                 30902162761279602895850647322624
        sender:                0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Docs: https://viem.sh/docs/contract/decodeErrorResult
      Version: viem@x.y.z]
    `)
  })
})

describe('entryPointVersion: 0.7', async () => {
  const [account, account_2, account_3] = await getSmartAccounts_07()

  test('default', async () => {
    const gas = await estimateUserOperationGas(bundlerClient, {
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
    expect(gas.callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(gas.preVerificationGas).toBeGreaterThanOrEqual(53000n)
    expect(gas.verificationGasLimit).toBeGreaterThanOrEqual(220000n)
  })

  test('args: paymaster (client)', async () => {
    const paymaster = await getVerifyingPaymaster_07()
    const server = await createVerifyingPaymasterServer(client, { paymaster })

    const paymasterClient = createPaymasterClient({
      transport: http(server.url),
    })

    const gas = await estimateUserOperationGas(bundlerClient, {
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

    expect(gas.callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(gas.preVerificationGas).toBeGreaterThanOrEqual(53000n)
    expect(gas.verificationGasLimit).toBeGreaterThanOrEqual(190000n)
    expect(gas.paymasterVerificationGasLimit).toBeGreaterThanOrEqual(20000n)
    expect(gas.paymasterPostOpGasLimit).toBeGreaterThanOrEqual(0n)
  })

  test('behavior: client.paymaster (client)', async () => {
    const paymaster = await getVerifyingPaymaster_07()
    const server = await createVerifyingPaymasterServer(client, { paymaster })

    const paymasterClient = createPaymasterClient({
      transport: http(server.url),
    })

    const bundlerClient = bundlerMainnet.getBundlerClient({
      paymaster: paymasterClient,
    })

    const gas = await estimateUserOperationGas(bundlerClient, {
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

    expect(gas.callGasLimit).toBeGreaterThanOrEqual(70000n)
    expect(gas.preVerificationGas).toBeGreaterThanOrEqual(59000n)
    expect(gas.verificationGasLimit).toBeGreaterThanOrEqual(190000n)
    expect(gas.paymasterVerificationGasLimit).toBeGreaterThanOrEqual(20000n)
    expect(gas.paymasterPostOpGasLimit).toBeGreaterThanOrEqual(0n)
  })

  test('behavior: prepared user operation', async () => {
    const userOp = await prepareUserOperation(bundlerClient, {
      account,
      calls: [
        {
          to: '0x0000000000000000000000000000000000000000',
          value: parseEther('1'),
        },
      ],
      ...fees,
    })

    const request = {
      ...userOp,
      account: undefined,
    } as const

    expectTypeOf(request).toMatchTypeOf<UserOperation>()

    const gas = await estimateUserOperationGas(bundlerClient, {
      ...request,
      entryPointAddress: account.entryPoint?.address,
    })

    expect(gas.callGasLimit).toBeGreaterThanOrEqual(16000n)
    expect(gas.preVerificationGas).toBeGreaterThanOrEqual(51000n)
    expect(gas.verificationGasLimit).toBeGreaterThanOrEqual(220000n)
    expect(gas.paymasterVerificationGasLimit).toBeGreaterThanOrEqual(0n)
    expect(gas.paymasterPostOpGasLimit).toBeGreaterThanOrEqual(0n)
  })

  test('error: insufficient funds', async () => {
    await expect(() =>
      estimateUserOperationGas(bundlerClient, {
        account,
        calls: [
          {
            to: '0x0000000000000000000000000000000000000000',
            value: parseEther('1000000'),
          },
        ],
        ...fees,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: Execution reverted with reason: UserOperation reverted during simulation with reason: 0x.

      Request Arguments:
        callData:              0xb61d27f6000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d3c21bcecceda100000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000
        factory:               0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688
        factoryData:           0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000
        maxFeePerGas:          15 gwei
        maxPriorityFeePerGas:  2 gwei
        nonce:                 30902162761095135455113551806464
        sender:                0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Details: UserOperation reverted during simulation with reason: 0x
      Version: viem@x.y.z]
    `)
  })

  test('error: contract revert', async () => {
    await expect(() =>
      estimateUserOperationGas(bundlerClient, {
        account,
        calls: [
          {
            to: wagmiContractConfig.address,
            abi: wagmiContractConfig.abi,
            functionName: 'mint',
            args: [420n],
          },
        ],
        ...fees,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: The contract function "mint" reverted with the following reason:
      Token ID is taken

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  mint(uint256 tokenId)
        args:          (420)
       
      Request Arguments:
        callData:              0xb61d27f6000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c2000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000024a0712d6800000000000000000000000000000000000000000000000000000000000001a400000000000000000000000000000000000000000000000000000000
        factory:               0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688
        factoryData:           0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000
        maxFeePerGas:          15 gwei
        maxPriorityFeePerGas:  2 gwei
        nonce:                 30902162761113582199187261358080
        sender:                0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Version: viem@x.y.z]
    `)
  })

  test('error: contract revert', async () => {
    await expect(() =>
      estimateUserOperationGas(bundlerClient, {
        account,
        calls: [
          {
            to: wagmiContractConfig.address,
            abi: wagmiContractConfig.abi,
            functionName: 'approve',
            args: ['0x0000000000000000000000000000000000000000', 420n],
          },
        ],
        ...fees,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: The contract function "approve" reverted with the following reason:
      ERC721: approve caller is not owner nor approved for all

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  approve(address to, uint256 tokenId)
        args:             (0x0000000000000000000000000000000000000000, 420)
       
      Request Arguments:
        callData:              0xb61d27f6000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c2000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044095ea7b3000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001a400000000000000000000000000000000000000000000000000000000
        factory:               0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688
        factoryData:           0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000
        maxFeePerGas:          15 gwei
        maxPriorityFeePerGas:  2 gwei
        nonce:                 30902162761132028943260970909696
        sender:                0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Version: viem@x.y.z]
    `)
  })

  test('error: contract revert (multiple calls)', async () => {
    await expect(() =>
      estimateUserOperationGas(bundlerClient, {
        account,
        calls: [
          {
            to: wagmiContractConfig.address,
            abi: wagmiContractConfig.abi,
            functionName: 'mint',
          },
          {
            to: wagmiContractConfig.address,
            abi: wagmiContractConfig.abi,
            functionName: 'approve',
            args: ['0x0000000000000000000000000000000000000000', 420n],
          },
        ],
        ...fees,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: The contract function "mint | approve" reverted with the following reason:
      ERC721: approve caller is not owner nor approved for all

       
      Request Arguments:
        callData:              0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c2000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044095ea7b3000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001a400000000000000000000000000000000000000000000000000000000
        factory:               0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688
        factoryData:           0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000
        maxFeePerGas:          15 gwei
        maxPriorityFeePerGas:  2 gwei
        nonce:                 30902162761150475687334680461312
        sender:                0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Version: viem@x.y.z]
    `)
  })

  test('error: function does not exist', async () => {
    await expect(() =>
      estimateUserOperationGas(bundlerClient, {
        account,
        calls: [
          {
            to: account.address,
            abi: wagmiContractConfig.abi,
            functionName: 'mint',
            args: [420n],
          },
        ],
        ...fees,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: The contract function "mint" returned no data ("0x").

      This could be due to any of the following:
        - The contract does not have the function "mint",
        - The parameters passed to the contract function may be invalid, or
        - The address is not a contract.
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  mint(uint256 tokenId)
        args:          (420)
       
      Request Arguments:
        callData:              0xb61d27f6000000000000000000000000f2f83eb89c48abd7ad93ba42c3ce904895337cea000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000024a0712d6800000000000000000000000000000000000000000000000000000000000001a400000000000000000000000000000000000000000000000000000000
        factory:               0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688
        factoryData:           0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000
        maxFeePerGas:          15 gwei
        maxPriorityFeePerGas:  2 gwei
        nonce:                 30902162761168922431408390012928
        sender:                0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Version: viem@x.y.z]
    `)
  })

  test('error: generic revert', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      estimateUserOperationGas(bundlerClient, {
        account,
        calls: [
          {
            to: '0x0000000000000000000000000000000000000000',
            value: parseEther('1'),
          },
          {
            abi: ErrorsExample.abi,
            to: contractAddress!,
            functionName: 'revertWrite',
          },
        ],
        ...fees,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: The contract function "revertWrite" reverted with the following reason:
      This is a revert message

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  revertWrite()
       
      Request Arguments:
        callData:              0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f4c5c29b14f0237131f7510a51684c8191f98e06000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004940b880200000000000000000000000000000000000000000000000000000000
        factory:               0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688
        factoryData:           0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000
        maxFeePerGas:          15 gwei
        maxPriorityFeePerGas:  2 gwei
        nonce:                 30902162761187369175482099564544
        sender:                0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Version: viem@x.y.z]
    `)
  })

  test('error: assert', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      estimateUserOperationGas(bundlerClient, {
        account,
        calls: [
          {
            to: '0x0000000000000000000000000000000000000000',
            value: parseEther('1'),
          },
          {
            abi: ErrorsExample.abi,
            to: contractAddress!,
            functionName: 'assertWrite',
          },
        ],
        ...fees,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: The contract function "assertWrite" reverted with the following reason:
      An \`assert\` condition failed.

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  assertWrite()
       
      Request Arguments:
        callData:              0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000934a389cabfb84cdb3f0260b2a4fd575b8b345a30000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000040469615200000000000000000000000000000000000000000000000000000000
        factory:               0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688
        factoryData:           0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000
        maxFeePerGas:          15 gwei
        maxPriorityFeePerGas:  2 gwei
        nonce:                 30902162761205815919555809116160
        sender:                0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Version: viem@x.y.z]
    `)
  })

  test('error: overflow', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      estimateUserOperationGas(bundlerClient, {
        account,
        calls: [
          {
            to: '0x0000000000000000000000000000000000000000',
            value: parseEther('1'),
          },
          {
            abi: ErrorsExample.abi,
            to: contractAddress!,
            functionName: 'overflowWrite',
          },
        ],
        ...fees,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: The contract function "overflowWrite" reverted with the following reason:
      Arithmetic operation resulted in underflow or overflow.

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  overflowWrite()
       
      Request Arguments:
        callData:              0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c91b651f770ed996a223a16da9ccd6f7df56c987000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004d44de86600000000000000000000000000000000000000000000000000000000
        factory:               0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688
        factoryData:           0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000
        maxFeePerGas:          15 gwei
        maxPriorityFeePerGas:  2 gwei
        nonce:                 30902162761224262663629518667776
        sender:                0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Version: viem@x.y.z]
    `)
  })

  test('error: divide by zero', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      estimateUserOperationGas(bundlerClient, {
        account,
        calls: [
          {
            to: '0x0000000000000000000000000000000000000000',
            value: parseEther('1'),
          },
          {
            abi: ErrorsExample.abi,
            to: contractAddress!,
            functionName: 'divideByZeroWrite',
          },
        ],
        ...fees,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: The contract function "divideByZeroWrite" reverted with the following reason:
      Division or modulo by zero (e.g. \`5 / 0\` or \`23 % 0\`).

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  divideByZeroWrite()
       
      Request Arguments:
        callData:              0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000b90acf57c3bfe8e0e8215defc282b5f48b3edc74000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004c66cf13300000000000000000000000000000000000000000000000000000000
        factory:               0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688
        factoryData:           0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000
        maxFeePerGas:          15 gwei
        maxPriorityFeePerGas:  2 gwei
        nonce:                 30902162761242709407703228219392
        sender:                0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Version: viem@x.y.z]
    `)
  })

  test('error: custom error', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      estimateUserOperationGas(bundlerClient, {
        account,
        calls: [
          {
            to: '0x0000000000000000000000000000000000000000',
            value: parseEther('1'),
          },
          {
            abi: ErrorsExample.abi,
            to: contractAddress!,
            functionName: 'simpleCustomWrite',
          },
        ],
        ...fees,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: The contract function "simpleCustomWrite" reverted.

      Error: SimpleError(string message)
                        (bugger)
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  simpleCustomWrite()
       
      Request Arguments:
        callData:              0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000787c6666213624d788522d516847978d7f348902000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004a997732e00000000000000000000000000000000000000000000000000000000
        factory:               0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688
        factoryData:           0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000
        maxFeePerGas:          15 gwei
        maxPriorityFeePerGas:  2 gwei
        nonce:                 30902162761261156151776937771008
        sender:                0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Version: viem@x.y.z]
    `)
  })

  test('error: custom error', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      estimateUserOperationGas(bundlerClient, {
        account,
        calls: [
          {
            to: '0x0000000000000000000000000000000000000000',
            value: parseEther('1'),
          },
          {
            abi: ErrorsExample.abi,
            to: contractAddress!,
            functionName: 'complexCustomWrite',
          },
        ],
        ...fees,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: The contract function "complexCustomWrite" reverted.

      Error: ComplexError((address sender, uint256 bar), string message, uint256 number)
                         ({"sender":"0x0000000000000000000000000000000000000000","bar":"69"}, bugger, 69)
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  complexCustomWrite()
       
      Request Arguments:
        callData:              0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000088d3caad49fc2e8e38c812c5f4acdd0a8b065f660000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000048de18b9100000000000000000000000000000000000000000000000000000000
        factory:               0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688
        factoryData:           0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000
        maxFeePerGas:          15 gwei
        maxPriorityFeePerGas:  2 gwei
        nonce:                 30902162761279602895850647322624
        sender:                0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

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
      estimateUserOperationGas(bundlerClient, {
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
        factory:               0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688
        factoryData:           0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000001
        maxFeePerGas:          15 gwei
        maxPriorityFeePerGas:  2 gwei
        nonce:                 30902162761021348478818713600000
        sender:                0xC6B426A3272a812dD1B3EDB601447bbAA8C1294C
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

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
        ...fees,
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
        callData:              0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000
        factory:               0x0000000000000000000000000000000000000000
        factoryData:           0x
        maxFeePerGas:          15 gwei
        maxPriorityFeePerGas:  2 gwei
        nonce:                 30902162761298049639924356874240
        sender:                0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea
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
      estimateUserOperationGas(bundlerClient, {
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

      factory: 0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688
      factoryData: 0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000002
      sender: 0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea
       
      Request Arguments:
        callData:              0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000
        factory:               0x5edb3ff1ea450d1ff6d614f24f5c760761f7f688
        factoryData:           0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000002
        maxFeePerGas:          15 gwei
        maxPriorityFeePerGas:  2 gwei
        nonce:                 30902162761316496383998066425856
        sender:                0xF2F83Eb89C48abd7aD93bA42C3ce904895337cea
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Details: UserOperation reverted during simulation with reason: AA14 initCode must return sender
      Version: viem@x.y.z]
    `)
  })
})

describe('entryPointVersion: 0.6', async () => {
  const [account] = await getSmartAccounts_06()

  test('default', async () => {
    const gas = await estimateUserOperationGas(bundlerClient, {
      account,
      calls: [
        {
          to: '0x0000000000000000000000000000000000000000',
          value: parseEther('1'),
        },
      ],
      ...fees,
    })
    expect(gas.callGasLimit).toBeGreaterThanOrEqual(80000n)
    expect(gas.preVerificationGas).toBeGreaterThanOrEqual(55000n)
    expect(gas.verificationGasLimit).toBeGreaterThanOrEqual(256000n)
  })

  test('behavior: prepared user operation', async () => {
    const request = {
      ...(await prepareUserOperation(bundlerClient, {
        account,
        calls: [
          {
            to: '0x0000000000000000000000000000000000000000',
            value: parseEther('1'),
          },
        ],
        ...fees,
      })),
      account: undefined,
    } as const

    expectTypeOf(request).toMatchTypeOf<UserOperation>()

    const gas = await estimateUserOperationGas(bundlerClient, {
      ...request,
      entryPointAddress: account.entryPoint.address,
    })
    expect(gas.callGasLimit).toBeGreaterThanOrEqual(80000n)
    expect(gas.preVerificationGas).toBeGreaterThanOrEqual(55000n)
    expect(gas.verificationGasLimit).toBeGreaterThanOrEqual(256000n)
  })

  test('error: aa13', async () => {
    await expect(() =>
      estimateUserOperationGas(bundlerClient, {
        account,
        calls: [{ to: '0x0000000000000000000000000000000000000000' }],
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
        callData:              0xb61d27f60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000
        initCode:              0x0000000000000000000000000000000000000000deadbeef
        maxFeePerGas:          15 gwei
        maxPriorityFeePerGas:  2 gwei
        nonce:                 30902162761058241966966132703232
        paymasterAndData:      0x
        sender:                0xc312a51324F449CF2389749B84Df3617373F2397
        signature:             0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

      Details: UserOperation reverted during simulation with reason: AA13 initCode failed or OOG
      Version: viem@x.y.z]
    `)
  })
})

test('error: account not defined', async () => {
  await expect(() =>
    // @ts-expect-error
    estimateUserOperationGas(bundlerClient, {
      account: undefined,
      calls: [{ to: '0x0000000000000000000000000000000000000000' }],
      ...fees,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [AccountNotFoundError: Could not find an Account to execute with this Action.
    Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the Client.

    Version: viem@x.y.z]
  `)
})
