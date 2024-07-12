import { describe, expect, test } from 'vitest'
import { ErrorsExample } from '../../../contracts/generated.js'
import { wagmiContractConfig } from '../../../test/src/abis.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { bundlerMainnet } from '../../../test/src/bundler.js'
import { accounts } from '../../../test/src/constants.js'
import {
  getSmartAccounts_06,
  getSmartAccounts_07,
} from '../../../test/src/smartAccounts.js'
import { deployErrorExample } from '../../../test/src/utils.js'
import { mine, writeContract } from '../../actions/index.js'
import { pad, parseEther } from '../../utils/index.js'
import { estimateUserOperationGas } from './estimateUserOperationGas.js'

const client = anvilMainnet.getClient()
const bundlerClient = bundlerMainnet.getBundlerClient()

describe('entryPointVersion: 0.7', async () => {
  await bundlerMainnet.restart()

  const [account, account_2, account_3] = await getSmartAccounts_07()

  test('default', async () => {
    expect(
      await estimateUserOperationGas(bundlerClient, {
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
      }),
    ).toMatchInlineSnapshot(`
      {
        "callGasLimit": 141653n,
        "paymasterPostOpGasLimit": 0n,
        "paymasterVerificationGasLimit": 0n,
        "preVerificationGas": 53438n,
        "verificationGasLimit": 259350n,
      }
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
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: The contract function "mint" reverted with the following reason:
      Token ID is taken

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  mint(uint256 tokenId)
        args:          (420)
       
      Request Arguments:
        callData:     0xb61d27f6000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c2000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000024a0712d6800000000000000000000000000000000000000000000000000000000000001a400000000000000000000000000000000000000000000000000000000
        factory:      0xfb6dab6200b8958c2655c3747708f82243d3f32e
        factoryData:  0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000
        nonce:        0
        sender:       0xE911628bF8428C23f179a07b081325cAe376DE1f
        signature:    0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

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
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: The contract function "approve" reverted with the following reason:
      ERC721: approve caller is not owner nor approved for all

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  approve(address to, uint256 tokenId)
        args:             (0x0000000000000000000000000000000000000000, 420)
       
      Request Arguments:
        callData:     0xb61d27f6000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c2000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044095ea7b3000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001a400000000000000000000000000000000000000000000000000000000
        factory:      0xfb6dab6200b8958c2655c3747708f82243d3f32e
        factoryData:  0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000
        nonce:        0
        sender:       0xE911628bF8428C23f179a07b081325cAe376DE1f
        signature:    0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

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
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: The contract function "mint | approve" reverted with the following reason:
      ERC721: approve caller is not owner nor approved for all

       
      Request Arguments:
        callData:     0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000041249c58b00000000000000000000000000000000000000000000000000000000000000000000000000000000fba3912ca04dd458c843e2ee08967fc04f3579c2000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044095ea7b3000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001a400000000000000000000000000000000000000000000000000000000
        factory:      0xfb6dab6200b8958c2655c3747708f82243d3f32e
        factoryData:  0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000
        nonce:        0
        sender:       0xE911628bF8428C23f179a07b081325cAe376DE1f
        signature:    0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

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
        callData:     0xb61d27f6000000000000000000000000e911628bf8428c23f179a07b081325cae376de1f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000024a0712d6800000000000000000000000000000000000000000000000000000000000001a400000000000000000000000000000000000000000000000000000000
        factory:      0xfb6dab6200b8958c2655c3747708f82243d3f32e
        factoryData:  0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000
        nonce:        0
        sender:       0xE911628bF8428C23f179a07b081325cAe376DE1f
        signature:    0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

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
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: The contract function "revertWrite" reverted with the following reason:
      This is a revert message

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  revertWrite()
       
      Request Arguments:
        callData:     0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f42ec71a4440f5e9871c643696dd6dc9a38911f8000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004940b880200000000000000000000000000000000000000000000000000000000
        factory:      0xfb6dab6200b8958c2655c3747708f82243d3f32e
        factoryData:  0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000
        nonce:        0
        sender:       0xE911628bF8428C23f179a07b081325cAe376DE1f
        signature:    0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

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
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: The contract function "assertWrite" reverted with the following reason:
      An \`assert\` condition failed.

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  assertWrite()
       
      Request Arguments:
        callData:     0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000bc71f5687cfd36f64ae6b4549186ee3a6ee259a40000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000040469615200000000000000000000000000000000000000000000000000000000
        factory:      0xfb6dab6200b8958c2655c3747708f82243d3f32e
        factoryData:  0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000
        nonce:        0
        sender:       0xE911628bF8428C23f179a07b081325cAe376DE1f
        signature:    0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

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
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: The contract function "overflowWrite" reverted with the following reason:
      Arithmetic operation resulted in underflow or overflow.

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  overflowWrite()
       
      Request Arguments:
        callData:     0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d73bab8f06db28c87932571f87d0d2c0fdf13d94000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004d44de86600000000000000000000000000000000000000000000000000000000
        factory:      0xfb6dab6200b8958c2655c3747708f82243d3f32e
        factoryData:  0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000
        nonce:        0
        sender:       0xE911628bF8428C23f179a07b081325cAe376DE1f
        signature:    0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

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
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: The contract function "divideByZeroWrite" reverted with the following reason:
      Division or modulo by zero (e.g. \`5 / 0\` or \`23 % 0\`).

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  divideByZeroWrite()
       
      Request Arguments:
        callData:     0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000028227b230d3945e580ed3b1c6c8ea1df658a7aa9000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004c66cf13300000000000000000000000000000000000000000000000000000000
        factory:      0xfb6dab6200b8958c2655c3747708f82243d3f32e
        factoryData:  0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000
        nonce:        0
        sender:       0xE911628bF8428C23f179a07b081325cAe376DE1f
        signature:    0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

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
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: The contract function "simpleCustomWrite" reverted.

      Error: SimpleError(string message)
                        (bugger)
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  simpleCustomWrite()
       
      Request Arguments:
        callData:     0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000082a9286db983093ff234cefcea1d8fa66382876b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004a997732e00000000000000000000000000000000000000000000000000000000
        factory:      0xfb6dab6200b8958c2655c3747708f82243d3f32e
        factoryData:  0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000
        nonce:        0
        sender:       0xE911628bF8428C23f179a07b081325cAe376DE1f
        signature:    0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

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
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UserOperationExecutionError: The contract function "complexCustomWrite" reverted.

      Error: ComplexError((address sender, uint256 bar), string message, uint256 number)
                         ({"sender":"0x0000000000000000000000000000000000000000","bar":"69"}, bugger, 69)
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  complexCustomWrite()
       
      Request Arguments:
        callData:     0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041219a0a9c0b86ed81933c788a6b63dfef8f17ee0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000048de18b9100000000000000000000000000000000000000000000000000000000
        factory:      0xfb6dab6200b8958c2655c3747708f82243d3f32e
        factoryData:  0xf14ddffc000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000
        nonce:        0
        sender:       0xE911628bF8428C23f179a07b081325cAe376DE1f
        signature:    0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c

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

describe.skip('entryPointVersion: 0.6', async () => {
  await bundlerMainnet.restart()

  const [account] = await getSmartAccounts_06()

  test('default', async () => {
    expect(
      await estimateUserOperationGas(bundlerClient, {
        account,
        calls: [
          {
            to: '0x0000000000000000000000000000000000000000',
            value: parseEther('1'),
          },
        ],
      }),
    ).toMatchInlineSnapshot(`
      {
        "callGasLimit": 80000n,
        "preVerificationGas": 55233n,
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
