/**
 * TODO:  Heaps more test cases :D
 *        - Complex calldata types
 *        - Complex return types (tuple/structs)
 *        - EIP-1559
 *        - Calls against blocks
 *        - Custom chain types
 *        - Custom nonce
 */

import { describe, expect, test } from 'vitest'
import {
  accounts,
  deployBAYC,
  publicClient,
  testClient,
  wagmiContractConfig,
  walletClient,
} from '../../_test/index.js'
import { baycContractConfig } from '../../_test/abis.js'
import { encodeFunctionData, parseEther, parseGwei } from '../../utils/index.js'
import { mine } from '../test/index.js'
import { sendTransaction } from '../wallet/index.js'

import { simulateContract } from './simulateContract.js'
import { deployErrorExample } from '../../_test/utils.js'
import { errorsExampleABI } from '../../_test/generated.js'

describe('wagmi', () => {
  test('default', async () => {
    expect(
      (
        await simulateContract(publicClient, {
          ...wagmiContractConfig,
          account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
          functionName: 'mint',
          args: [69420n],
        })
      ).result,
    ).toEqual(undefined)
    expect(
      (
        await simulateContract(publicClient, {
          ...wagmiContractConfig,
          functionName: 'safeTransferFrom',
          account: '0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6',
          args: [
            '0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6',
            '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
            1n,
          ],
        })
      ).result,
    ).toEqual(undefined)
  })

  test('overloaded function', async () => {
    expect(
      (
        await simulateContract(publicClient, {
          ...wagmiContractConfig,
          account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
          functionName: 'mint',
        })
      ).result,
    ).toEqual(undefined)
  })

  test('no account', async () => {
    await expect(() =>
      simulateContract(publicClient, {
        ...wagmiContractConfig,
        functionName: 'mint',
        args: [69420n],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "The contract function \\"mint\\" reverted with the following reason:
      ERC721: mint to the zero address

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  mint(uint256 tokenId)
        args:          (69420)

      Docs: https://viem.sh/docs/contract/simulateContract.html
      Version: viem@1.0.2"
    `)
  })

  test('revert', async () => {
    await expect(() =>
      simulateContract(publicClient, {
        ...wagmiContractConfig,
        functionName: 'approve',
        args: ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC', 420n],
        account: accounts[0].address,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "The contract function \\"approve\\" reverted with the following reason:
      ERC721: approval to current owner

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  approve(address to, uint256 tokenId)
        args:             (0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC, 420)
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Docs: https://viem.sh/docs/contract/simulateContract.html
      Version: viem@1.0.2"
    `)
    await expect(() =>
      simulateContract(publicClient, {
        ...wagmiContractConfig,
        functionName: 'mint',
        args: [1n],
        account: accounts[0].address,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "The contract function \\"mint\\" reverted with the following reason:
      Token ID is taken

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  mint(uint256 tokenId)
        args:          (1)
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Docs: https://viem.sh/docs/contract/simulateContract.html
      Version: viem@1.0.2"
    `)
    await expect(() =>
      simulateContract(publicClient, {
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
      "The contract function \\"safeTransferFrom\\" reverted with the following reason:
      ERC721: transfer caller is not owner nor approved

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  safeTransferFrom(address from, address to, uint256 tokenId)
        args:                      (0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6, 0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC, 1)
        sender:    0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC

      Docs: https://viem.sh/docs/contract/simulateContract.html
      Version: viem@1.0.2"
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
        (
          await simulateContract(publicClient, {
            abi: baycContractConfig.abi,
            address: contractAddress!,
            functionName: 'mintApe',
            account: accounts[0].address,
            args: [1n],
            value: 1000000000000000000n,
          })
        ).result,
      ).toBe(undefined)
    })

    test('reserveApes', async () => {
      const { contractAddress } = await deployBAYC()

      // Reserve apes
      expect(
        (
          await simulateContract(publicClient, {
            abi: baycContractConfig.abi,
            address: contractAddress!,
            functionName: 'reserveApes',
            account: accounts[0].address,
          })
        ).result,
      ).toBe(undefined)
    })
  })

  describe('revert', () => {
    test('sale inactive', async () => {
      const { contractAddress } = await deployBAYC()

      // Expect mint to fail.
      await expect(() =>
        simulateContract(publicClient, {
          abi: baycContractConfig.abi,
          address: contractAddress!,
          functionName: 'mintApe',
          account: accounts[0].address,
          args: [1n],
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`
        "The contract function \\"mintApe\\" reverted with the following reason:
        Sale must be active to mint Ape

        Contract Call:
          address:   0x0000000000000000000000000000000000000000
          function:  mintApe(uint256 numberOfTokens)
          args:             (1)
          sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

        Docs: https://viem.sh/docs/contract/simulateContract.html
        Version: viem@1.0.2"
      `)
    })
  })
})

describe('contract errors', () => {
  test(
    'revert',
    async () => {
      const { contractAddress } = await deployErrorExample()

      await expect(() =>
        simulateContract(publicClient, {
          abi: errorsExampleABI,
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

        Docs: https://viem.sh/docs/contract/simulateContract.html
        Version: viem@1.0.2]
      `)
    },
    { retry: 3 },
  )

  test(
    'assert',
    async () => {
      const { contractAddress } = await deployErrorExample()

      await expect(() =>
        simulateContract(publicClient, {
          abi: errorsExampleABI,
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

        Docs: https://viem.sh/docs/contract/simulateContract.html
        Version: viem@1.0.2]
      `)
    },
    { retry: 3 },
  )

  test('overflow', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      simulateContract(publicClient, {
        abi: errorsExampleABI,
        address: contractAddress!,
        functionName: 'overflowWrite',
        account: accounts[0].address,
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "overflowWrite" reverted with the following reason:
      Arithmic operation resulted in underflow or overflow.

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  overflowWrite()
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Docs: https://viem.sh/docs/contract/simulateContract.html
      Version: viem@1.0.2]
    `)
  })

  test('divide by zero', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      simulateContract(publicClient, {
        abi: errorsExampleABI,
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

      Docs: https://viem.sh/docs/contract/simulateContract.html
      Version: viem@1.0.2]
    `)
  })

  test('require', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      simulateContract(publicClient, {
        abi: errorsExampleABI,
        address: contractAddress!,
        functionName: 'requireWrite',
        account: accounts[0].address,
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "requireWrite" reverted with the following reason:
      execution reverted

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  requireWrite()
        sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Docs: https://viem.sh/docs/contract/simulateContract.html
      Version: viem@1.0.2]
    `)
  })

  test('custom error: simple', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      simulateContract(publicClient, {
        abi: errorsExampleABI,
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

      Docs: https://viem.sh/docs/contract/simulateContract.html
      Version: viem@1.0.2]
    `)
  })

  test('custom error: complex', async () => {
    const { contractAddress } = await deployErrorExample()

    await expect(() =>
      simulateContract(publicClient, {
        abi: errorsExampleABI,
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

      Docs: https://viem.sh/docs/contract/simulateContract.html
      Version: viem@1.0.2]
    `)
  })
})

test('fake contract address', async () => {
  await expect(() =>
    simulateContract(publicClient, {
      abi: [
        {
          name: 'mint',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [],
          outputs: [{ type: 'uint256' }],
        },
      ],
      address: '0x0000000000000000000000000000000000000069',
      functionName: 'mint',
      account: accounts[0].address,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    "The contract function \\"mint\\" returned no data (\\"0x\\").

    This could be due to any of the following:
      - The contract does not have the function \\"mint\\",
      - The parameters passed to the contract function may be invalid, or
      - The address is not a contract.
     
    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  mint()
      sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

    Docs: https://viem.sh/docs/contract/simulateContract.html
    Version: viem@1.0.2"
  `)
})

describe('node errors', () => {
  test('fee cap too high', async () => {
    await expect(() =>
      simulateContract(publicClient, {
        ...wagmiContractConfig,
        account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        functionName: 'mint',
        args: [69420n],
        maxFeePerGas: 2n ** 256n - 1n + 1n,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "The fee cap (\`maxFeePerGas\` = 115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei) cannot be higher than the maximum allowed value (2^256-1).

      Raw Call Arguments:
        from:          0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC
        to:            0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
        data:          0xa0712d680000000000000000000000000000000000000000000000000000000000010f2c
        maxFeePerGas:  115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  mint(uint256 tokenId)
        args:          (69420)
        sender:    0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC

      Docs: https://viem.sh/docs/contract/simulateContract.html
      Version: viem@1.0.2"
    `)
  })

  // TODO: Fix anvil error reason
  test('gas too low', async () => {
    await expect(() =>
      simulateContract(publicClient, {
        ...wagmiContractConfig,
        account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        functionName: 'mint',
        args: [69420n],
        gas: 100n,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "An internal error was received.

      URL: http://localhost
      Request body: {\\"method\\":\\"eth_call\\",\\"params\\":[{\\"from\\":\\"0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC\\",\\"data\\":\\"0xa0712d680000000000000000000000000000000000000000000000000000000000010f2c\\",\\"gas\\":\\"0x64\\",\\"to\\":\\"0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2\\"},\\"latest\\"]}
       
      Raw Call Arguments:
        from:  0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC
        to:    0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
        data:  0xa0712d680000000000000000000000000000000000000000000000000000000000010f2c
        gas:   100
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  mint(uint256 tokenId)
        args:          (69420)
        sender:    0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC

      Docs: https://viem.sh/docs/contract/simulateContract.html
      Details: EVM error OutOfGas
      Version: viem@1.0.2"
    `)
  })

  // TODO: Fix anvil error (should throw gas too high)
  test.skip('fee cap too low', async () => {
    await expect(() =>
      simulateContract(publicClient, {
        ...wagmiContractConfig,
        account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        functionName: 'mint',
        args: [69420n],
        gas: 100_000_000_000_000_000n,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot()
  })

  // TODO: Fix anvil – this should fail
  test.skip('fee cap too low', async () => {
    await expect(() =>
      simulateContract(publicClient, {
        ...wagmiContractConfig,
        account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        functionName: 'mint',
        args: [69420n],
        maxFeePerGas: 1n,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot()
  })

  // TODO: Fix anvil – this should fail
  test.skip('nonce too low', async () => {
    await expect(() =>
      simulateContract(publicClient, {
        ...wagmiContractConfig,
        account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        functionName: 'mint',
        args: [69420n],
        nonce: 0,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot()
  })

  // TODO: Fix anvil – this should fail with reason
  test('insufficient funds', async () => {
    await expect(() =>
      simulateContract(publicClient, {
        ...wagmiContractConfig,
        account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        functionName: 'mint',
        args: [69420n],
        // @ts-expect-error
        value: parseEther('100000'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "The contract function \\"mint\\" reverted with the following reason:
      execution reverted

      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  mint(uint256 tokenId)
        args:          (69420)
        sender:    0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC

      Docs: https://viem.sh/docs/contract/simulateContract.html
      Version: viem@1.0.2"
    `)
  })

  test('maxFeePerGas less than maxPriorityFeePerGas', async () => {
    await expect(() =>
      simulateContract(publicClient, {
        ...wagmiContractConfig,
        account: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        functionName: 'mint',
        args: [69420n],
        maxFeePerGas: parseGwei('20'),
        maxPriorityFeePerGas: parseGwei('22'),
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "The provided tip (\`maxPriorityFeePerGas\` = 22 gwei) cannot be higher than the fee cap (\`maxFeePerGas\` = 20 gwei).

      Raw Call Arguments:
        from:                  0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC
        to:                    0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
        data:                  0xa0712d680000000000000000000000000000000000000000000000000000000000010f2c
        maxFeePerGas:          20 gwei
        maxPriorityFeePerGas:  22 gwei
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  mint(uint256 tokenId)
        args:          (69420)
        sender:    0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC

      Docs: https://viem.sh/docs/contract/simulateContract.html
      Version: viem@1.0.2"
    `)
  })
})
