/**
 * TODO:  Heaps more test cases :D
 *        - Complex calldata types
 *        - Complex return types (tuple/structs)
 */
import { describe, expect, test, vi } from 'vitest'

import { ErrorsExample, GH434 } from '~contracts/generated.js'
import {
  baycContractConfig,
  usdcContractConfig,
  wagmiContractConfig,
} from '~test/src/abis.js'
import { accounts, address } from '~test/src/constants.js'
import { deploy, deployErrorExample } from '~test/src/utils.js'
import { anvilMainnet } from '../../../test/src/anvil.js'
import { mainnet } from '../../chains/index.js'

import { createPublicClient } from '../../clients/createPublicClient.js'
import { http } from '../../clients/transports/http.js'
import type { Hex } from '../../types/misc.js'
import { pad } from '../../utils/data/pad.js'
import { toHex } from '../../utils/encoding/toHex.js'
import { multicall } from './multicall.js'
import * as readContract from './readContract.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  const spy = vi.spyOn(readContract, 'readContract')
  expect(
    await multicall(client, {
      blockNumber: anvilMainnet.forkBlockNumber,
      contracts: [
        {
          ...usdcContractConfig,
          functionName: 'totalSupply',
        },
        {
          ...usdcContractConfig,
          functionName: 'balanceOf',
          args: [address.vitalik],
        },
        {
          ...baycContractConfig,
          functionName: 'totalSupply',
        },
      ],
    }),
  ).toMatchInlineSnapshot(`
    [
      {
        "result": 25386964533553076n,
        "status": "success",
      },
      {
        "result": 9063377042n,
        "status": "success",
      },
      {
        "result": 10000n,
        "status": "success",
      },
    ]
  `)
  expect(spy).toHaveBeenCalledOnce()
})

test('args: allowFailure', async () => {
  expect(
    await multicall(client, {
      allowFailure: false,
      blockNumber: anvilMainnet.forkBlockNumber,
      contracts: [
        {
          ...usdcContractConfig,
          functionName: 'totalSupply',
        },
        {
          ...usdcContractConfig,
          functionName: 'balanceOf',
          args: [address.vitalik],
        },
        {
          ...baycContractConfig,
          functionName: 'totalSupply',
        },
      ],
    }),
  ).toMatchInlineSnapshot(`
    [
      25386964533553076n,
      9063377042n,
      10000n,
    ]
  `)
})

test('args: batchSize', async () => {
  const spy_1 = vi.spyOn(readContract, 'readContract')
  expect(
    await multicall(client, {
      batchSize: 64,
      blockNumber: anvilMainnet.forkBlockNumber,
      contracts: [
        {
          ...usdcContractConfig,
          functionName: 'totalSupply',
        },
        {
          ...usdcContractConfig,
          functionName: 'totalSupply',
        },
        {
          ...usdcContractConfig,
          functionName: 'balanceOf',
          args: [address.vitalik],
        },
        {
          ...baycContractConfig,
          functionName: 'totalSupply',
        },
        {
          ...usdcContractConfig,
          functionName: 'totalSupply',
        },
        {
          ...usdcContractConfig,
          functionName: 'balanceOf',
          args: [address.vitalik],
        },
        {
          ...baycContractConfig,
          functionName: 'totalSupply',
        },
        {
          ...usdcContractConfig,
          functionName: 'totalSupply',
        },
        {
          ...usdcContractConfig,
          functionName: 'balanceOf',
          args: [address.vitalik],
        },
        {
          ...baycContractConfig,
          functionName: 'totalSupply',
        },
      ],
    }),
  ).toMatchInlineSnapshot(`
    [
      {
        "result": 25386964533553076n,
        "status": "success",
      },
      {
        "result": 25386964533553076n,
        "status": "success",
      },
      {
        "result": 9063377042n,
        "status": "success",
      },
      {
        "result": 10000n,
        "status": "success",
      },
      {
        "result": 25386964533553076n,
        "status": "success",
      },
      {
        "result": 9063377042n,
        "status": "success",
      },
      {
        "result": 10000n,
        "status": "success",
      },
      {
        "result": 25386964533553076n,
        "status": "success",
      },
      {
        "result": 9063377042n,
        "status": "success",
      },
      {
        "result": 10000n,
        "status": "success",
      },
    ]
  `)
  expect(spy_1).toBeCalledTimes(3)

  const spy_2 = vi.spyOn(readContract, 'readContract')
  await multicall(client, {
    batchSize: 32,
    blockNumber: anvilMainnet.forkBlockNumber,
    contracts: [
      {
        ...usdcContractConfig,
        functionName: 'balanceOf',
        args: [address.vitalik],
      },
      {
        ...usdcContractConfig,
        functionName: 'totalSupply',
      },
      {
        ...usdcContractConfig,
        functionName: 'totalSupply',
      },
    ],
  })
  expect(spy_2).toBeCalledTimes(2)

  const spy_3 = vi.spyOn(readContract, 'readContract')
  await multicall(client, {
    batchSize: 0,
    blockNumber: anvilMainnet.forkBlockNumber,
    contracts: [
      {
        ...usdcContractConfig,
        functionName: 'balanceOf',
        args: [address.vitalik],
      },
      {
        ...usdcContractConfig,
        functionName: 'totalSupply',
      },
      {
        ...usdcContractConfig,
        functionName: 'totalSupply',
      },
    ],
  })
  expect(spy_3).toHaveBeenCalledOnce()
})

test('args: multicallAddress', async () => {
  expect(
    await multicall(client, {
      blockNumber: anvilMainnet.forkBlockNumber,
      contracts: [
        {
          ...usdcContractConfig,
          functionName: 'totalSupply',
        },
        {
          ...usdcContractConfig,
          functionName: 'balanceOf',
          args: [address.vitalik],
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
        "result": 25386964533553076n,
        "status": "success",
      },
      {
        "result": 9063377042n,
        "status": "success",
      },
      {
        "result": 10000n,
        "status": "success",
      },
    ]
  `)
})

test('args: stateOverride', async () => {
  const fakeName = 'NotWagmi'

  // layout of strings in storage
  const nameSlot = toHex(0, { size: 32 })
  const fakeNameHex = toHex(fakeName)
  // we don't divide by 2 because length must be length * 2 if word is strictly less than 32 bytes
  const bytesLen = fakeNameHex.length - 2

  expect(bytesLen).toBeLessThanOrEqual(62)

  const slotValue = `${pad(fakeNameHex, { dir: 'right', size: 31 })}${toHex(
    bytesLen,
    { size: 1 },
  ).slice(2)}` as Hex

  expect(
    await multicall(client, {
      batchSize: 2,
      contracts: [
        {
          ...wagmiContractConfig,
          functionName: 'name',
        },
        {
          ...wagmiContractConfig,
          functionName: 'name',
        },
        {
          ...wagmiContractConfig,
          functionName: 'name',
        },
      ],
      stateOverride: [
        {
          address: wagmiContractConfig.address,
          stateDiff: [
            {
              slot: nameSlot,
              value: slotValue,
            },
          ],
        },
      ],
    }),
  ).toMatchInlineSnapshot(`
    [
      {
        "result": "${fakeName}",
        "status": "success",
      },
      {
        "result": "${fakeName}",
        "status": "success",
      },
      {
        "result": "${fakeName}",
        "status": "success",
      },
    ]
  `)
})

describe('errors', async () => {
  describe('allowFailure is truthy', async () => {
    test('function not found', async () => {
      const res = await multicall(client, {
        blockNumber: anvilMainnet.forkBlockNumber,
        contracts: [
          {
            ...usdcContractConfig,
            // @ts-expect-error
            functionName: 'lol',
          },
          {
            ...usdcContractConfig,
            functionName: 'balanceOf',
            args: [address.vitalik],
          },
          {
            ...baycContractConfig,
            functionName: 'totalSupply',
          },
        ],
      })
      expect(res).toMatchInlineSnapshot(`
        [
          {
            "error": [ContractFunctionExecutionError: The contract function "lol" returned no data ("0x").

        This could be due to any of the following:
          - The contract does not have the function "lol",
          - The parameters passed to the contract function may be invalid, or
          - The address is not a contract.
         
        Contract Call:
          address:  0x0000000000000000000000000000000000000000

        Docs: https://viem.sh/docs/contract/multicall
        Version: viem@x.y.z],
            "result": undefined,
            "status": "failure",
          },
          {
            "result": 9063377042n,
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
      const res = await multicall(client, {
        blockNumber: anvilMainnet.forkBlockNumber,
        contracts: [
          {
            ...usdcContractConfig,
            functionName: 'balanceOf',
            // @ts-expect-error invalid args
            args: [address.vitalik, 1n],
          },
          {
            ...usdcContractConfig,
            functionName: 'balanceOf',
            args: [address.vitalik],
          },
          {
            ...baycContractConfig,
            functionName: 'totalSupply',
          },
        ],
      })
      expect(res).toMatchInlineSnapshot(`
        [
          {
            "error": [ContractFunctionExecutionError: The contract function "balanceOf" returned no data ("0x").

        This could be due to any of the following:
          - The contract does not have the function "balanceOf",
          - The parameters passed to the contract function may be invalid, or
          - The address is not a contract.
         
        Contract Call:
          address:   0x0000000000000000000000000000000000000000
          function:  balanceOf(address account)
          args:               (0xd8da6bf26964af9d7eed9e03e53415d37aa96045)

        Docs: https://viem.sh/docs/contract/multicall
        Version: viem@x.y.z],
            "result": undefined,
            "status": "failure",
          },
          {
            "result": 9063377042n,
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
        await multicall(client, {
          blockNumber: anvilMainnet.forkBlockNumber,
          contracts: [
            {
              ...usdcContractConfig,
              address: '0x0000000000000000000000000000000000000000',
              functionName: 'balanceOf',
              args: [address.vitalik],
            },
            {
              ...usdcContractConfig,
              functionName: 'balanceOf',
              args: [address.vitalik],
            },
            {
              ...baycContractConfig,
              functionName: 'totalSupply',
            },
          ] as const,
        }),
      ).toMatchInlineSnapshot(`
        [
          {
            "error": [ContractFunctionExecutionError: The contract function "balanceOf" returned no data ("0x").

        This could be due to any of the following:
          - The contract does not have the function "balanceOf",
          - The parameters passed to the contract function may be invalid, or
          - The address is not a contract.
         
        Contract Call:
          address:   0x0000000000000000000000000000000000000000
          function:  balanceOf(address account)
          args:               (0xd8da6bf26964af9d7eed9e03e53415d37aa96045)

        Docs: https://viem.sh/docs/contract/multicall
        Version: viem@x.y.z],
            "result": undefined,
            "status": "failure",
          },
          {
            "result": 9063377042n,
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
      const res = await multicall(client, {
        blockNumber: anvilMainnet.forkBlockNumber,
        contracts: [
          {
            ...usdcContractConfig,
            functionName: 'balanceOf',
            args: [address.vitalik],
          },
          {
            ...usdcContractConfig,
            functionName: 'balanceOf',
            args: [address.vitalik],
          },
          {
            ...wagmiContractConfig,
            functionName: 'transferFrom',
            args: [address.vitalik, accounts[0].address, 1n],
          },
          {
            ...baycContractConfig,
            functionName: 'totalSupply',
          },
          {
            ...baycContractConfig,
            functionName: 'tokenOfOwnerByIndex',
            args: [address.vitalik, 1n],
          },
        ],
      })
      expect(res).toMatchInlineSnapshot(`
        [
          {
            "result": 9063377042n,
            "status": "success",
          },
          {
            "result": 9063377042n,
            "status": "success",
          },
          {
            "error": [ContractFunctionExecutionError: The contract function "transferFrom" reverted with the following reason:
        ERC721: transfer caller is not owner nor approved

        Contract Call:
          address:   0x0000000000000000000000000000000000000000
          function:  transferFrom(address from, address to, uint256 tokenId)
          args:                  (0xd8da6bf26964af9d7eed9e03e53415d37aa96045, 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266, 1)

        Docs: https://viem.sh/docs/contract/multicall
        Version: viem@x.y.z],
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

        Contract Call:
          address:   0x0000000000000000000000000000000000000000
          function:  tokenOfOwnerByIndex(address owner, uint256 index)
          args:                         (0xd8da6bf26964af9d7eed9e03e53415d37aa96045, 1)

        Docs: https://viem.sh/docs/contract/multicall
        Version: viem@x.y.z],
            "result": undefined,
            "status": "failure",
          },
        ]
      `)
    })

    test('contract revert: error not found on abi', async () => {
      const { contractAddress } = await deployErrorExample()

      const abi = ErrorsExample.abi.filter(
        (abiItem) => abiItem.name !== 'SimpleError',
      )

      expect(
        await multicall(client, {
          contracts: [
            {
              ...usdcContractConfig,
              functionName: 'balanceOf',
              args: [address.vitalik],
            },
            {
              ...usdcContractConfig,
              functionName: 'balanceOf',
              args: [address.vitalik],
            },
            {
              abi,
              address: contractAddress!,
              functionName: 'simpleCustomRead',
            },
          ] as const,
        }),
      ).toMatchInlineSnapshot(`
        [
          {
            "result": 9063377042n,
            "status": "success",
          },
          {
            "result": 9063377042n,
            "status": "success",
          },
          {
            "error": [ContractFunctionExecutionError: The contract function "simpleCustomRead" reverted with the following signature:
        0xf9006398

        Unable to decode signature "0xf9006398" as it was not found on the provided ABI.
        Make sure you are using the correct ABI and that the error exists on it.
        You can look up the decoded signature here: https://openchain.xyz/signatures?query=0xf9006398.
         
        Contract Call:
          address:   0x0000000000000000000000000000000000000000
          function:  simpleCustomRead()

        Docs: https://viem.sh/docs/contract/decodeErrorResult
        Version: viem@x.y.z],
            "result": undefined,
            "status": "failure",
          },
        ]
      `)
    })

    test('`aggregate3` call failure', async () => {
      vi.spyOn(readContract, 'readContract')
        .mockResolvedValueOnce([
          {
            success: true,
            returnData:
              '0x0000000000000000000000000000000000000000000000000000000000002710',
          },
          {
            success: true,
            returnData:
              '0x00000000000000000000000000000000000000000000000000000035e566fd0a',
          },
        ])
        .mockRejectedValueOnce(new Error('err_1'))
        .mockResolvedValueOnce([
          {
            success: true,
            returnData:
              '0x0000000000000000000000000000000000000000000000000000000000002710',
          },
          {
            success: true,
            returnData:
              '0x00000000000000000000000000000000000000000000000000003648d8f5db0b',
          },
        ])
        .mockRejectedValueOnce(new Error('err_2'))

      expect(
        await multicall(client, {
          batchSize: 72,
          blockNumber: anvilMainnet.forkBlockNumber,
          contracts: [
            {
              ...baycContractConfig,
              functionName: 'totalSupply',
            },
            {
              ...usdcContractConfig,
              functionName: 'balanceOf',
              args: [address.vitalik],
            },
            {
              ...usdcContractConfig,
              functionName: 'balanceOf',
              args: [address.usdcHolder],
            },
            {
              ...usdcContractConfig,
              functionName: 'balanceOf',
              args: [address.vitalik],
            },
            {
              ...baycContractConfig,
              functionName: 'totalSupply',
            },
            {
              ...usdcContractConfig,
              functionName: 'balanceOf',
              args: [address.usdcHolder],
            },
            {
              ...usdcContractConfig,
              functionName: 'balanceOf',
              args: [address.vitalik],
            },
            {
              ...usdcContractConfig,
              functionName: 'balanceOf',
              args: [address.usdcHolder],
            },
            {
              ...usdcContractConfig,
              functionName: 'balanceOf',
              args: [address.vitalik],
            },
            {
              ...usdcContractConfig,
              // @ts-expect-error
              functionName: 'lol',
            },
            {
              ...baycContractConfig,
              functionName: 'totalSupply',
            },
          ],
        }),
      ).toMatchInlineSnapshot(`
        [
          {
            "result": 10000n,
            "status": "success",
          },
          {
            "result": 231481998602n,
            "status": "success",
          },
          {
            "error": [Error: err_1],
            "result": undefined,
            "status": "failure",
          },
          {
            "error": [Error: err_1],
            "result": undefined,
            "status": "failure",
          },
          {
            "result": 10000n,
            "status": "success",
          },
          {
            "result": 59686505536267n,
            "status": "success",
          },
          {
            "error": [Error: err_2],
            "result": undefined,
            "status": "failure",
          },
          {
            "error": [Error: err_2],
            "result": undefined,
            "status": "failure",
          },
          {
            "result": 9063377042n,
            "status": "success",
          },
          {
            "error": [ContractFunctionExecutionError: The contract function "lol" returned no data ("0x").

        This could be due to any of the following:
          - The contract does not have the function "lol",
          - The parameters passed to the contract function may be invalid, or
          - The address is not a contract.
         
        Contract Call:
          address:  0x0000000000000000000000000000000000000000

        Docs: https://viem.sh/docs/contract/multicall
        Version: viem@x.y.z],
            "result": undefined,
            "status": "failure",
          },
          {
            "result": 10000n,
            "status": "success",
          },
        ]
      `)
    })
  })

  describe('allowFailure is falsy', async () => {
    test('function not found', async () => {
      const res = multicall(client, {
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
            args: [address.vitalik],
          },
          {
            ...baycContractConfig,
            functionName: 'totalSupply',
          },
        ],
      })
      await expect(() => res).rejects.toMatchInlineSnapshot(`
        [ContractFunctionExecutionError: Function "lol" not found on ABI.
        Make sure you are using the correct ABI and that the function exists on it.

        Contract Call:
          address:  0x0000000000000000000000000000000000000000

        Docs: https://viem.sh/docs/contract/encodeFunctionData
        Version: viem@x.y.z]
      `)
    })

    test('invalid params', async () => {
      const res = multicall(client, {
        allowFailure: false,
        contracts: [
          {
            ...usdcContractConfig,
            functionName: 'balanceOf',
            // @ts-expect-error
            args: [address.vitalik, 1n],
          },
          {
            ...usdcContractConfig,
            functionName: 'balanceOf',
            args: [address.vitalik],
          },
          {
            ...baycContractConfig,
            functionName: 'totalSupply',
          },
        ],
      })
      await expect(() => res).rejects.toMatchInlineSnapshot(`
        [ContractFunctionExecutionError: ABI encoding params/values length mismatch.
        Expected length (params): 1
        Given length (values): 2

        Contract Call:
          address:   0x0000000000000000000000000000000000000000
          function:  balanceOf(address account)
          args:               (0xd8da6bf26964af9d7eed9e03e53415d37aa96045)

        Docs: https://viem.sh/docs/contract/multicall
        Version: viem@x.y.z]
      `)
    })

    test('invalid contract address', async () => {
      await expect(() =>
        multicall(client, {
          allowFailure: false,
          contracts: [
            {
              ...usdcContractConfig,
              address: '0x0000000000000000000000000000000000000000',
              functionName: 'balanceOf',
              args: [address.vitalik],
            },
            {
              ...usdcContractConfig,
              functionName: 'balanceOf',
              args: [address.vitalik],
            },
            {
              ...baycContractConfig,
              functionName: 'totalSupply',
            },
          ] as const,
        }),
      ).rejects.toMatchInlineSnapshot(`
        [ContractFunctionExecutionError: The contract function "balanceOf" returned no data ("0x").

        This could be due to any of the following:
          - The contract does not have the function "balanceOf",
          - The parameters passed to the contract function may be invalid, or
          - The address is not a contract.
         
        Contract Call:
          address:   0x0000000000000000000000000000000000000000
          function:  balanceOf(address account)
          args:               (0xd8da6bf26964af9d7eed9e03e53415d37aa96045)

        Docs: https://viem.sh/docs/contract/multicall
        Version: viem@x.y.z]
      `)
    })

    test('contract revert', async () => {
      const res = multicall(client, {
        allowFailure: false,
        contracts: [
          {
            ...usdcContractConfig,
            functionName: 'balanceOf',
            args: [address.vitalik],
          },
          {
            ...usdcContractConfig,
            functionName: 'balanceOf',
            args: [address.vitalik],
          },
          {
            ...wagmiContractConfig,
            functionName: 'transferFrom',
            args: [address.vitalik, accounts[0].address, 1n],
          },
          {
            ...baycContractConfig,
            functionName: 'totalSupply',
          },
          {
            ...baycContractConfig,
            functionName: 'tokenOfOwnerByIndex',
            args: [address.vitalik, 1n],
          },
        ],
      })
      await expect(() => res).rejects.toMatchInlineSnapshot(`
        [ContractFunctionExecutionError: The contract function "transferFrom" reverted with the following reason:
        ERC721: transfer caller is not owner nor approved

        Contract Call:
          address:   0x0000000000000000000000000000000000000000
          function:  transferFrom(address from, address to, uint256 tokenId)
          args:                  (0xd8da6bf26964af9d7eed9e03e53415d37aa96045, 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266, 1)

        Docs: https://viem.sh/docs/contract/multicall
        Version: viem@x.y.z]
      `)
    })
  })

  test('contract revert: error not found on abi', async () => {
    const { contractAddress } = await deployErrorExample()

    const abi = ErrorsExample.abi.filter(
      (abiItem) => abiItem.name !== 'SimpleError',
    )

    await expect(() =>
      multicall(client, {
        allowFailure: false,
        contracts: [
          {
            ...usdcContractConfig,
            functionName: 'balanceOf',
            args: [address.vitalik],
          },
          {
            ...usdcContractConfig,
            functionName: 'balanceOf',
            args: [address.vitalik],
          },
          {
            abi,
            address: contractAddress!,
            functionName: 'simpleCustomRead',
          },
        ] as const,
      }),
    ).rejects.toMatchInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "simpleCustomRead" reverted with the following signature:
      0xf9006398

      Unable to decode signature "0xf9006398" as it was not found on the provided ABI.
      Make sure you are using the correct ABI and that the error exists on it.
      You can look up the decoded signature here: https://openchain.xyz/signatures?query=0xf9006398.
       
      Contract Call:
        address:   0x0000000000000000000000000000000000000000
        function:  simpleCustomRead()

      Docs: https://viem.sh/docs/contract/decodeErrorResult
      Version: viem@x.y.z]
    `)
  })

  test('`aggregate3` call failure', async () => {
    vi.spyOn(readContract, 'readContract')
      .mockResolvedValueOnce([
        {
          success: true,
          returnData:
            '0x0000000000000000000000000000000000000000000000000000000000002710',
        },
        {
          success: true,
          returnData:
            '0x00000000000000000000000000000000000000000000000000000035e566fd0a',
        },
      ])
      .mockRejectedValueOnce(new Error('err_1'))

    await expect(() =>
      multicall(client, {
        allowFailure: false,
        batchSize: 72,
        blockNumber: anvilMainnet.forkBlockNumber,
        contracts: [
          {
            ...baycContractConfig,
            functionName: 'totalSupply',
          },
          {
            ...usdcContractConfig,
            functionName: 'balanceOf',
            args: [address.vitalik],
          },
          {
            ...usdcContractConfig,
            functionName: 'balanceOf',
            args: [address.usdcHolder],
          },
          {
            ...usdcContractConfig,
            functionName: 'balanceOf',
            args: [address.vitalik],
          },
          {
            ...baycContractConfig,
            functionName: 'totalSupply',
          },
          {
            ...usdcContractConfig,
            functionName: 'balanceOf',
            args: [address.usdcHolder],
          },
          {
            ...usdcContractConfig,
            functionName: 'balanceOf',
            args: [address.vitalik],
          },
          {
            ...baycContractConfig,
            functionName: 'totalSupply',
          },
        ],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot('[Error: err_1]')
  })
})

test('chain not provided', async () => {
  await expect(() =>
    multicall(
      createPublicClient({
        transport: http(anvilMainnet.rpcUrl.http),
      }),
      {
        blockNumber: anvilMainnet.forkBlockNumber,
        contracts: [
          {
            ...usdcContractConfig,
            functionName: 'totalSupply',
          },
          {
            ...usdcContractConfig,
            functionName: 'balanceOf',
            args: [address.vitalik],
          },
          {
            ...baycContractConfig,
            functionName: 'totalSupply',
          },
        ],
      },
    ),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    '[Error: client chain not configured. multicallAddress is required.]',
  )
})

test('multicall contract not configured for chain', async () => {
  await expect(() =>
    multicall(
      createPublicClient({
        chain: {
          ...mainnet,
          contracts: {},
        },
        transport: http(anvilMainnet.rpcUrl.http),
      }),
      {
        blockNumber: anvilMainnet.forkBlockNumber,
        contracts: [
          {
            ...usdcContractConfig,
            functionName: 'totalSupply',
          },
          {
            ...usdcContractConfig,
            functionName: 'balanceOf',
            args: [address.vitalik],
          },
          {
            ...baycContractConfig,
            functionName: 'totalSupply',
          },
        ],
      },
    ),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ChainDoesNotSupportContract: Chain "Ethereum" does not support contract "multicall3".

    This could be due to any of the following:
    - The chain does not have the contract "multicall3" configured.

    Version: viem@x.y.z]
  `)
})

test('multicall contract deployed on later block', async () => {
  await expect(() =>
    multicall(client, {
      blockNumber: 69420n,
      contracts: [
        {
          ...usdcContractConfig,
          functionName: 'totalSupply',
        },
        {
          ...usdcContractConfig,
          functionName: 'balanceOf',
          args: [address.vitalik],
        },
        {
          ...baycContractConfig,
          functionName: 'totalSupply',
        },
      ],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ChainDoesNotSupportContract: Chain "Ethereum (Local)" does not support contract "multicall3".

    This could be due to any of the following:
    - The contract "multicall3" was not deployed until block 14353601 (current block 69420).

    Version: viem@x.y.z]
  `)
})

test('batchSize on client', async () => {
  const client = createPublicClient({
    batch: {
      multicall: {
        batchSize: 1024,
      },
    },
    chain: anvilMainnet.chain,
    transport: http(),
  })

  const contracts = []
  for (let i = 0; i < 1_000; i++) {
    contracts.push({
      ...usdcContractConfig,
      functionName: 'totalSupply',
    })
  }

  await multicall(client, {
    contracts,
  })
})

describe('GitHub repros', () => {
  test('https://github.com/wevm/viem/issues/434', async () => {
    const { contractAddress } = await deploy(client, {
      abi: GH434.abi,
      bytecode: GH434.bytecode.object,
    })

    expect(
      await multicall(client, {
        allowFailure: false,
        contracts: [
          {
            abi: GH434.abi,
            address: contractAddress!,
            functionName: 'foo',
          },
          {
            abi: GH434.abi,
            address: contractAddress!,
            functionName: 'bar',
          },
          {
            abi: GH434.abi,
            address: contractAddress!,
            functionName: 'baz',
          },
        ],
      }),
    ).toMatchInlineSnapshot(`
      [
        [
          42069n,
          true,
        ],
        "hi",
        69420n,
      ]
    `)
  })
})
