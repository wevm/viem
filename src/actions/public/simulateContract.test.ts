/**
 * TODO:  Heaps more test cases :D
 *        - Complex calldata types
 *        - Complex return types (tuple/structs)
 *        - EIP-1559
 *        - Calls against blocks
 *        - Custom chain types
 *        - Custom nonce
 *        - More reverts (custom errors/Error(string)/Panic(uint256))
 */

import { describe, expect, test } from 'vitest'
import {
  accounts,
  publicClient,
  testClient,
  wagmiContractConfig,
  walletClient,
} from '../../_test'
import { baycContractConfig } from '../../_test/abis'
import { encodeFunctionData } from '../../utils'
import { mine } from '../test'
import { sendTransaction } from '../wallet'

import { deployContract } from './deployContract'
import { getTransactionReceipt } from './getTransactionReceipt'
import { simulateContract } from './simulateContract'

describe('wagmi', () => {
  test('default', async () => {
    expect(
      (
        await simulateContract(publicClient, {
          ...wagmiContractConfig,
          from: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
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
          from: '0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6',
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
          from: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
          functionName: 'mint',
        })
      ).result,
    ).toEqual(undefined)
  })

  test('revert', async () => {
    await expect(() =>
      simulateContract(publicClient, {
        ...wagmiContractConfig,
        functionName: 'approve',
        args: ['0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC', 420n],
        from: accounts[0].address,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "The contract function \\"approve\\" reverted with the following reason:
      ERC721: approval to current owner

      Contract:  0x0000000000000000000000000000000000000000
      Function:  approve(address to, uint256 tokenId)
      Arguments:        (0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC, 420)
      Sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Docs: https://viem.sh/docs/contract/simulateContract
      Version: viem@1.0.2"
    `)
    await expect(() =>
      simulateContract(publicClient, {
        ...wagmiContractConfig,
        functionName: 'mint',
        args: [1n],
        from: accounts[0].address,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "The contract function \\"mint\\" reverted with the following reason:
      Token ID is taken

      Contract:  0x0000000000000000000000000000000000000000
      Function:  mint(uint256 tokenId)
      Arguments:     (1)
      Sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

      Docs: https://viem.sh/docs/contract/simulateContract
      Version: viem@1.0.2"
    `)
    await expect(() =>
      simulateContract(publicClient, {
        ...wagmiContractConfig,
        functionName: 'safeTransferFrom',
        from: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
        args: [
          '0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6',
          '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
          1n,
        ],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "The contract function \\"safeTransferFrom\\" reverted with the following reason:
      ERC721: transfer caller is not owner nor approved

      Contract:  0x0000000000000000000000000000000000000000
      Function:  safeTransferFrom(address from, address to, uint256 tokenId)
      Arguments:                 (0x1a1E021A302C237453D3D45c7B82B19cEEB7E2e6, 0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC, 1)
      Sender:    0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC

      Docs: https://viem.sh/docs/contract/simulateContract
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
        from: accounts[0].address,
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
            from: accounts[0].address,
            args: [1n],
            value: 1000000000000000000n,
          })
        ).result,
      ).toBe(undefined)
    })

    test('get a free $100k', async () => {
      const { contractAddress } = await deployBAYC()

      // Reserve apes
      expect(
        (
          await simulateContract(publicClient, {
            abi: baycContractConfig.abi,
            address: contractAddress!,
            functionName: 'reserveApes',
            from: accounts[0].address,
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
          from: accounts[0].address,
          args: [1n],
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`
        "The contract function \\"mintApe\\" reverted with the following reason:
        Sale must be active to mint Ape

        Contract:  0x0000000000000000000000000000000000000000
        Function:  mintApe(uint256 numberOfTokens)
        Arguments:        (1)
        Sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

        Docs: https://viem.sh/docs/contract/simulateContract
        Version: viem@1.0.2"
      `)
    })
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
      from: accounts[0].address,
      args: [],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    "The contract function \\"mint\\" returned no data (\\"0x\\").

    This could be due to any of the following:
    - The contract does not have the function \\"mint\\",
    - The parameters passed to the contract function may be invalid, or
    - The address is not a contract.
     
    Contract:  0x0000000000000000000000000000000000000000
    Function:  mint()
    Sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

    Docs: https://viem.sh/docs/contract/simulateContract
    Version: viem@1.0.2"
  `)
})

// Deploy BAYC Contract
async function deployBAYC() {
  const hash = await deployContract(walletClient, {
    ...baycContractConfig,
    args: ['Bored Ape Wagmi Club', 'BAYC', 69420n, 0n],
    from: accounts[0].address,
  })
  await mine(testClient, { blocks: 1 })
  const { contractAddress } = await getTransactionReceipt(publicClient, {
    hash,
  })
  return { contractAddress }
}
