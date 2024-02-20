/**
 * TODO:  More test cases :D
 *        - EIP-1559
 *        - Custom chain types
 *        - Custom nonce
 */
import { describe, expect, test } from 'vitest'

import { ErrorsExample } from '~test/contracts/generated.js'
import { baycContractConfig, wagmiContractConfig } from '~test/src/abis.js'
import { accounts } from '~test/src/constants.js'
import {
  deployBAYC,
  deployErrorExample,
  publicClient,
  testClient,
  walletClient,
} from '~test/src/utils.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { encodeFunctionData } from '../../utils/abi/encodeFunctionData.js'
import { mine } from '../test/mine.js'
import { sendTransaction } from '../wallet/sendTransaction.js'

import { estimateContractGas } from './estimateContractGas.js'

describe('wagmi', () => {
  test('default', async () => {
    expect(
      await estimateContractGas(publicClient, {
        ...wagmiContractConfig,
        account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        functionName: 'mint',
        args: [69420n],
      }),
    ).toBeDefined()
    expect(
      await estimateContractGas(publicClient, {
        ...wagmiContractConfig,
        account: '0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6',
        functionName: 'safeTransferFrom',
        args: [
          '0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6',
          '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
          1n,
        ],
      }),
    ).toBeDefined()
  })

  test('overloaded function', async () => {
    expect(
      await estimateContractGas(publicClient, {
        ...wagmiContractConfig,
        account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        functionName: 'mint',
      }),
    ).toBeDefined()
  })

  test('revert', async () => {
    await expect(() =>
      estimateContractGas(publicClient, {
        ...wagmiContractConfig,
        functionName: 'approve',
        args: ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC', 420n],
        account: accounts[0].address,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "approve" reverted with the following reason:
      ERC721: approval to current owner

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  approve(address to, uint256 tokenId)
        args:             (0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC, 420)
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Docs: https://viem.sh/docs/contract/estimateContractGas
      Version: viem@1.0.2]
    `)
    await expect(() =>
      estimateContractGas(publicClient, {
        ...wagmiContractConfig,
        functionName: 'mint',
        args: [1n],
        account: accounts[0].address,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "mint" reverted with the following reason:
      Token ID is taken

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  mint(uint256 tokenId)
        args:          (1)
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Docs: https://viem.sh/docs/contract/estimateContractGas
      Version: viem@1.0.2]
    `)
    await expect(() =>
      estimateContractGas(publicClient, {
        ...wagmiContractConfig,
        functionName: 'safeTransferFrom',
        account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        args: [
          '0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6',
          '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
          1n,
        ],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "safeTransferFrom" reverted with the following reason:
      ERC721: transfer caller is not owner nor approved

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  safeTransferFrom(address from, address to, uint256 tokenId)
        args:                      (0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6, 0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC, 1)
        sender:    0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC

      Docs: https://viem.sh/docs/contract/estimateContractGas
      Version: viem@1.0.2]
    `)
  })
})

describe('BAYC', () => {
  describe('default', () => {
    test('mintApe', async () => {
      const { contractAddress } = await deployBAYC()

      // Set sale state to active
      // TODO: replace w/ writeContract
      await sendTransaction(walletClient, {
        data: encodeFunctionData({
          abi: baycContractConfig.abi,
          functionName: 'flipSaleState',
        }),
        account: accounts[0].address,
        to: contractAddress!,
      })
      await mine(testClient, { blocks: 1 })

      // Mint an Ape!
      expect(
        await estimateContractGas(publicClient, {
          abi: baycContractConfig.abi,
          address: contractAddress!,
          functionName: 'mintApe',
          account: accounts[0].address,
          args: [1n],
          value: 1000000000000000000n,
        }),
      ).toBeDefined()
    })

    test('reserveApes', async () => {
      const { contractAddress } = await deployBAYC()

      // Reserve apes
      expect(
        await estimateContractGas(publicClient, {
          abi: baycContractConfig.abi,
          address: contractAddress!,
          functionName: 'reserveApes',
          account: accounts[0].address,
        }),
      ).toBeDefined()
    })
  })

  describe('revert', () => {
    test('sale inactive', async () => {
      const { contractAddress } = await deployBAYC()

      // Expect mint to fail.
      await expect(() =>
        estimateContractGas(publicClient, {
          abi: baycContractConfig.abi,
          address: contractAddress!,
          functionName: 'mintApe',
          account: accounts[0].address,
          args: [1n],
          value: 1n,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`
        [ContractFunctionExecutionError: The contract function "mintApe" reverted with the following reason:
        Sale must be active to mint Ape

        Contract Call:
          address:   0x0000000000000000000000000000000000000000
          function:  mintApe(uint256 numberOfTokens)
          args:             (1)
          sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

        Docs: https://viem.sh/docs/contract/estimateContractGas
        Version: viem@1.0.2]
      `)
    })
  })
})

describe('local account', () => {
  test('default', async () => {
    expect(
      await estimateContractGas(publicClient, {
        ...wagmiContractConfig,
        account: privateKeyToAccount(accounts[0].privateKey),
        functionName: 'mint',
        args: [69420n],
      }),
    ).toBeDefined()
  })
})

describe('contract errors', () => {
  test('revert', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      estimateContractGas(publicClient, {
        abi: ErrorsExample.abi,
        address: contractAddress!,
        functionName: 'revertWrite',
        account: accounts[0].address,
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "revertWrite" reverted with the following reason:
      This is a revert message

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  revertWrite()
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Docs: https://viem.sh/docs/contract/estimateContractGas
      Version: viem@1.0.2]
    `)
  })

  test('assert', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      estimateContractGas(publicClient, {
        abi: ErrorsExample.abi,
        address: contractAddress!,
        functionName: 'assertWrite',
        account: accounts[0].address,
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "assertWrite" reverted with the following reason:
      An \`assert\` condition failed.

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  assertWrite()
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Docs: https://viem.sh/docs/contract/estimateContractGas
      Version: viem@1.0.2]
    `)
  })

  test('overflow', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      estimateContractGas(publicClient, {
        abi: ErrorsExample.abi,
        address: contractAddress!,
        functionName: 'overflowWrite',
        account: accounts[0].address,
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "overflowWrite" reverted with the following reason:
      Arithmetic operation resulted in underflow or overflow.

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  overflowWrite()
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Docs: https://viem.sh/docs/contract/estimateContractGas
      Version: viem@1.0.2]
    `)
  })

  test('divide by zero', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      estimateContractGas(publicClient, {
        abi: ErrorsExample.abi,
        address: contractAddress!,
        functionName: 'divideByZeroWrite',
        account: accounts[0].address,
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "divideByZeroWrite" reverted with the following reason:
      Division or modulo by zero (e.g. \`5 / 0\` or \`23 % 0\`).

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  divideByZeroWrite()
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Docs: https://viem.sh/docs/contract/estimateContractGas
      Version: viem@1.0.2]
    `)
  })

  test('require', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      estimateContractGas(publicClient, {
        abi: ErrorsExample.abi,
        address: contractAddress!,
        functionName: 'requireWrite',
        account: accounts[0].address,
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "requireWrite" reverted.

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  requireWrite()
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Docs: https://viem.sh/docs/contract/estimateContractGas
      Version: viem@1.0.2]
    `)
  })

  test('custom error: simple', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      estimateContractGas(publicClient, {
        abi: ErrorsExample.abi,
        address: contractAddress!,
        functionName: 'simpleCustomWrite',
        account: accounts[0].address,
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "simpleCustomWrite" reverted.

      Error: SimpleError(string message)
                        (bugger)
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  simpleCustomWrite()
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Docs: https://viem.sh/docs/contract/estimateContractGas
      Version: viem@1.0.2]
    `)
  })

  test('custom error: complex', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      estimateContractGas(publicClient, {
        abi: ErrorsExample.abi,
        address: contractAddress!,
        functionName: 'complexCustomWrite',
        account: accounts[0].address,
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "complexCustomWrite" reverted.

      Error: ComplexError((address sender, uint256 bar), string message, uint256 number)
                         ({"sender":"0x0000000000000000000000000000000000000000","bar":"69"}, bugger, 69)
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  complexCustomWrite()
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Docs: https://viem.sh/docs/contract/estimateContractGas
      Version: viem@1.0.2]
    `)
  })
})
