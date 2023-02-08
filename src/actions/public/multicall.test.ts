/**
 * TODO:  Heaps more test cases :D
 *        - Complex calldata types
 *        - Complex return types (tuple/structs)
 */

import { describe, expect, test } from 'vitest'
import {
  accounts,
  initialBlockNumber,
  publicClient,
  usdcContractConfig,
  vitalikAddress,
} from '../../_test'
import { baycContractConfig, wagmiContractConfig } from '../../_test/abis'

import { multicall } from './multicall'

test('default', async () => {
  expect(
    await multicall(publicClient, {
      blockNumber: initialBlockNumber,
      contracts: [
        {
          ...usdcContractConfig,
          functionName: 'totalSupply',
        },
        {
          ...usdcContractConfig,
          functionName: 'balanceOf',
          args: [vitalikAddress],
        },
        {
          ...baycContractConfig,
          functionName: 'totalSupply',
        },
      ],
      multicallAddress: '0xca11bde05977b3631167028862be2a173976ca11',
    }),
  ).toMatchInlineSnapshot(`
    [
      {
        "result": 41119586940119550n,
        "status": "success",
      },
      {
        "result": 231481998602n,
        "status": "success",
      },
      {
        "result": 10000n,
        "status": "success",
      },
    ]
  `)
})

describe('errors', async () => {
  describe('allowFailure is truthy', async () => {
    test('function not found', async () => {
      expect(
        await multicall(publicClient, {
          blockNumber: initialBlockNumber,
          contracts: [
            {
              ...usdcContractConfig,
              // @ts-expect-error
              functionName: 'lol',
            },
            {
              ...usdcContractConfig,
              functionName: 'balanceOf',
              args: [vitalikAddress],
            },
            {
              ...baycContractConfig,
              functionName: 'totalSupply',
            },
          ],
          multicallAddress: '0xca11bde05977b3631167028862be2a173976ca11',
        }),
      ).toMatchInlineSnapshot(`
        [
          {
            "error": [ContractFunctionExecutionError: The contract function "lol" returned no data ("0x").

        This could be due to any of the following:
        - The contract does not have the function "lol",
        - The parameters passed to the contract function may be invalid, or
        - The address is not a contract.
         
        Contract:  0x0000000000000000000000000000000000000000

        Docs: https://viem.sh/docs/contract/multicall
        Version: viem@1.0.2],
            "result": undefined,
            "status": "failure",
          },
          {
            "result": 231481998602n,
            "status": "success",
          },
          {
            "result": 10000n,
            "status": "success",
          },
        ]
      `)
    })

    test('invalid params', async () => {
      expect(
        await multicall(publicClient, {
          blockNumber: initialBlockNumber,
          // @ts-expect-error
          contracts: [
            {
              ...usdcContractConfig,
              functionName: 'balanceOf',
              args: [vitalikAddress, 1n],
            },
            {
              ...usdcContractConfig,
              functionName: 'balanceOf',
              args: [vitalikAddress],
            },
            {
              ...baycContractConfig,
              functionName: 'totalSupply',
            },
          ] as const,
          multicallAddress: '0xca11bde05977b3631167028862be2a173976ca11',
        }),
      ).toMatchInlineSnapshot(`
        [
          {
            "error": [ContractFunctionExecutionError: The contract function "balanceOf" returned no data ("0x").

        This could be due to any of the following:
        - The contract does not have the function "balanceOf",
        - The parameters passed to the contract function may be invalid, or
        - The address is not a contract.
         
        Contract:  0x0000000000000000000000000000000000000000
        Function:  balanceOf(address account)
        Arguments:          (0xd8da6bf26964af9d7eed9e03e53415d37aa96045)

        Docs: https://viem.sh/docs/contract/multicall
        Version: viem@1.0.2],
            "result": undefined,
            "status": "failure",
          },
          {
            "result": 231481998602n,
            "status": "success",
          },
          {
            "result": 10000n,
            "status": "success",
          },
        ]
      `)
    })

    test('invalid contract address', async () => {
      expect(
        await multicall(publicClient, {
          blockNumber: initialBlockNumber,
          contracts: [
            {
              ...usdcContractConfig,
              address: '0x0000000000000000000000000000000000000000',
              functionName: 'balanceOf',
              args: [vitalikAddress],
            },
            {
              ...usdcContractConfig,
              functionName: 'balanceOf',
              args: [vitalikAddress],
            },
            {
              ...baycContractConfig,
              functionName: 'totalSupply',
            },
          ] as const,
          multicallAddress: '0xca11bde05977b3631167028862be2a173976ca11',
        }),
      ).toMatchInlineSnapshot(`
        [
          {
            "error": [ContractFunctionExecutionError: The contract function "balanceOf" returned no data ("0x").

        This could be due to any of the following:
        - The contract does not have the function "balanceOf",
        - The parameters passed to the contract function may be invalid, or
        - The address is not a contract.
         
        Contract:  0x0000000000000000000000000000000000000000
        Function:  balanceOf(address account)
        Arguments:          (0xd8da6bf26964af9d7eed9e03e53415d37aa96045)

        Docs: https://viem.sh/docs/contract/multicall
        Version: viem@1.0.2],
            "result": undefined,
            "status": "failure",
          },
          {
            "result": 231481998602n,
            "status": "success",
          },
          {
            "result": 10000n,
            "status": "success",
          },
        ]
      `)
    })

    test('contract revert', async () => {
      expect(
        await multicall(publicClient, {
          blockNumber: initialBlockNumber,
          contracts: [
            {
              ...usdcContractConfig,
              functionName: 'balanceOf',
              args: [vitalikAddress],
            },
            {
              ...usdcContractConfig,
              functionName: 'balanceOf',
              args: [vitalikAddress],
            },
            {
              ...wagmiContractConfig,
              functionName: 'transferFrom',
              args: [vitalikAddress, accounts[0].address, 1n],
            },
            {
              ...baycContractConfig,
              functionName: 'totalSupply',
            },
            {
              ...baycContractConfig,
              functionName: 'tokenOfOwnerByIndex',
              args: [vitalikAddress, 1n],
            },
          ] as const,
          multicallAddress: '0xca11bde05977b3631167028862be2a173976ca11',
        }),
      ).toMatchInlineSnapshot(`
        [
          {
            "result": 231481998602n,
            "status": "success",
          },
          {
            "result": 231481998602n,
            "status": "success",
          },
          {
            "error": [ContractFunctionExecutionError: The contract function "transferFrom" reverted with the following reason:
        ERC721: transfer caller is not owner nor approved

        Contract:  0x0000000000000000000000000000000000000000
        Function:  transferFrom(address from, address to, uint256 tokenId)
        Arguments:             (0xd8da6bf26964af9d7eed9e03e53415d37aa96045, 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266, 1)

        Docs: https://viem.sh/docs/contract/multicall
        Version: viem@1.0.2],
            "result": undefined,
            "status": "failure",
          },
          {
            "result": 10000n,
            "status": "success",
          },
          {
            "error": [ContractFunctionExecutionError: The contract function "tokenOfOwnerByIndex" reverted with the following reason:
        EnumerableSet: index out of bounds

        Contract:  0x0000000000000000000000000000000000000000
        Function:  tokenOfOwnerByIndex(address owner, uint256 index)
        Arguments:                    (0xd8da6bf26964af9d7eed9e03e53415d37aa96045, 1)

        Docs: https://viem.sh/docs/contract/multicall
        Version: viem@1.0.2],
            "result": undefined,
            "status": "failure",
          },
        ]
      `)
    })
  })

  describe('allowFailure is falsy', async () => {
    test('function not found', async () => {
      await expect(() =>
        multicall(publicClient, {
          allowFailure: false,
          contracts: [
            {
              ...usdcContractConfig,
              // @ts-expect-error
              functionName: 'lol',
            },
            {
              ...usdcContractConfig,
              functionName: 'balanceOf',
              args: [vitalikAddress],
            },
            {
              ...baycContractConfig,
              functionName: 'totalSupply',
            },
          ],
          multicallAddress: '0xca11bde05977b3631167028862be2a173976ca11',
        }),
      ).rejects.toMatchInlineSnapshot(`
        [ContractFunctionExecutionError: Function "lol" not found on ABI.
        Make sure you are using the correct ABI and that the function exists on it.

        Contract:  0x0000000000000000000000000000000000000000

        Docs: https://viem.sh/docs/contract/encodeFunctionData
        Version: viem@1.0.2]
      `)
    })

    test('invalid params', async () => {
      await expect(() =>
        multicall(publicClient, {
          allowFailure: false,
          // @ts-expect-error
          contracts: [
            {
              ...usdcContractConfig,
              functionName: 'balanceOf',
              args: [vitalikAddress, 1n],
            },
            {
              ...usdcContractConfig,
              functionName: 'balanceOf',
              args: [vitalikAddress],
            },
            {
              ...baycContractConfig,
              functionName: 'totalSupply',
            },
          ] as const,
          multicallAddress: '0xca11bde05977b3631167028862be2a173976ca11',
        }),
      ).rejects.toMatchInlineSnapshot(`
        [ContractFunctionExecutionError: ABI encoding params/values length mismatch.
        Expected length (params): 1
        Given length (values): 2

        Contract:  0x0000000000000000000000000000000000000000
        Function:  balanceOf(address account)
        Arguments:          (0xd8da6bf26964af9d7eed9e03e53415d37aa96045)

        Docs: https://viem.sh/docs/contract/multicall
        Version: viem@1.0.2]
      `)
    })

    test('invalid contract address', async () => {
      await expect(() =>
        multicall(publicClient, {
          allowFailure: false,
          contracts: [
            {
              ...usdcContractConfig,
              address: '0x0000000000000000000000000000000000000000',
              functionName: 'balanceOf',
              args: [vitalikAddress],
            },
            {
              ...usdcContractConfig,
              functionName: 'balanceOf',
              args: [vitalikAddress],
            },
            {
              ...baycContractConfig,
              functionName: 'totalSupply',
            },
          ] as const,
          multicallAddress: '0xca11bde05977b3631167028862be2a173976ca11',
        }),
      ).rejects.toMatchInlineSnapshot(`
        [ContractFunctionExecutionError: The contract function "balanceOf" returned no data ("0x").

        This could be due to any of the following:
        - The contract does not have the function "balanceOf",
        - The parameters passed to the contract function may be invalid, or
        - The address is not a contract.
         
        Contract:  0x0000000000000000000000000000000000000000
        Function:  balanceOf(address account)
        Arguments:          (0xd8da6bf26964af9d7eed9e03e53415d37aa96045)

        Docs: https://viem.sh/docs/contract/multicall
        Version: viem@1.0.2]
      `)
    })

    test('contract revert', async () => {
      await expect(() =>
        multicall(publicClient, {
          allowFailure: false,
          contracts: [
            {
              ...usdcContractConfig,
              functionName: 'balanceOf',
              args: [vitalikAddress],
            },
            {
              ...usdcContractConfig,
              functionName: 'balanceOf',
              args: [vitalikAddress],
            },
            {
              ...wagmiContractConfig,
              functionName: 'transferFrom',
              args: [vitalikAddress, accounts[0].address, 1n],
            },
            {
              ...baycContractConfig,
              functionName: 'totalSupply',
            },
            {
              ...baycContractConfig,
              functionName: 'tokenOfOwnerByIndex',
              args: [vitalikAddress, 1n],
            },
          ] as const,
          multicallAddress: '0xca11bde05977b3631167028862be2a173976ca11',
        }),
      ).rejects.toMatchInlineSnapshot(`
        [ContractFunctionExecutionError: The contract function "transferFrom" reverted with the following reason:
        ERC721: transfer caller is not owner nor approved

        Contract:  0x0000000000000000000000000000000000000000
        Function:  transferFrom(address from, address to, uint256 tokenId)
        Arguments:             (0xd8da6bf26964af9d7eed9e03e53415d37aa96045, 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266, 1)

        Docs: https://viem.sh/docs/contract/multicall
        Version: viem@1.0.2]
      `)
    })
  })
})
