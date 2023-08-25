/**
 * TODO:  Heaps more test cases :D
 *        - Complex calldata types
 *        - Complex return types (tuple/structs)
 */
import { describe, expect, test } from 'vitest'

import gh434 from '../../../contracts/out/GH434.sol/GH434.json'
import {
  baycContractConfig,
  usdcContractConfig,
  wagmiContractConfig,
} from '../../_test/abis.js'
import {
  accounts,
  address,
  forkBlockNumber,
  localHttpUrl,
} from '../../_test/constants.js'
import { errorsExampleABI, gh434ABI } from '../../_test/generated.js'
import {
  anvilChain,
  deploy,
  deployErrorExample,
  publicClient,
} from '../../_test/utils.js'
import { mainnet } from '../../chains/index.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { http } from '../../clients/transports/http.js'
import type { Hex } from '../../types/misc.js'

import { multicall } from './multicall.js'

test('default', async () => {
  expect(
    await multicall(publicClient, {
      blockNumber: forkBlockNumber,
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

test('args: allowFailure', async () => {
  expect(
    await multicall(publicClient, {
      allowFailure: false,
      blockNumber: forkBlockNumber,
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
      41119586940119550n,
      231481998602n,
      10000n,
    ]
  `)
})

test('args: multicallAddress', async () => {
  expect(
    await multicall(publicClient, {
      blockNumber: forkBlockNumber,
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
          blockNumber: forkBlockNumber,
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
        }),
      ).toMatchInlineSnapshot(`
        [
          {
            "error": [ContractFunctionExecutionError: The contract function "lol" returned no data ("0x").

        This could be due to any of the following:
          - The contract does not have the function "lol",
          - The parameters passed to the contract function may be invalid, or
          - The address is not a contract.
         
        Contract Call:
          address:  0x0000000000000000000000000000000000000000

        Docs: https://viem.sh/docs/contract/multicall.html
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
          blockNumber: forkBlockNumber,
          // @ts-ignore
          contracts: [
            {
              ...usdcContractConfig,
              functionName: 'balanceOf',
              // @ts-ignore
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

        Docs: https://viem.sh/docs/contract/multicall.html
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
          blockNumber: forkBlockNumber,
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

        Docs: https://viem.sh/docs/contract/multicall.html
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
          blockNumber: forkBlockNumber,
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
          ] as const,
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

        Contract Call:
          address:   0x0000000000000000000000000000000000000000
          function:  transferFrom(address from, address to, uint256 tokenId)
          args:                  (0xd8da6bf26964af9d7eed9e03e53415d37aa96045, 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266, 1)

        Docs: https://viem.sh/docs/contract/multicall.html
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

        Contract Call:
          address:   0x0000000000000000000000000000000000000000
          function:  tokenOfOwnerByIndex(address owner, uint256 index)
          args:                         (0xd8da6bf26964af9d7eed9e03e53415d37aa96045, 1)

        Docs: https://viem.sh/docs/contract/multicall.html
        Version: viem@1.0.2],
            "result": undefined,
            "status": "failure",
          },
        ]
      `)
    })

    test('contract revert: error not found on abi', async () => {
      const { contractAddress } = await deployErrorExample()

      const abi = errorsExampleABI.filter(
        (abiItem) => abiItem.name !== 'SimpleError',
      )

      expect(
        await multicall(publicClient, {
          blockNumber: forkBlockNumber,
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
            "result": 231481998602n,
            "status": "success",
          },
          {
            "result": 231481998602n,
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

        Docs: https://viem.sh/docs/contract/decodeErrorResult.html
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
              args: [address.vitalik],
            },
            {
              ...baycContractConfig,
              functionName: 'totalSupply',
            },
          ],
        }),
      ).rejects.toMatchInlineSnapshot(`
        [ContractFunctionExecutionError: Function "lol" not found on ABI.
        Make sure you are using the correct ABI and that the function exists on it.

        Contract Call:
          address:  0x0000000000000000000000000000000000000000

        Docs: https://viem.sh/docs/contract/encodeFunctionData.html
        Version: viem@1.0.2]
      `)
    })

    test('invalid params', async () => {
      await expect(() =>
        multicall(publicClient, {
          allowFailure: false,
          // @ts-ignore
          contracts: [
            {
              ...usdcContractConfig,
              functionName: 'balanceOf',
              // @ts-ignore
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
          ] as const,
        }),
      ).rejects.toMatchInlineSnapshot(`
        [ContractFunctionExecutionError: ABI encoding params/values length mismatch.
        Expected length (params): 1
        Given length (values): 2

        Contract Call:
          address:   0x0000000000000000000000000000000000000000
          function:  balanceOf(address account)
          args:               (0xd8da6bf26964af9d7eed9e03e53415d37aa96045)

        Docs: https://viem.sh/docs/contract/multicall.html
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

        Docs: https://viem.sh/docs/contract/multicall.html
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
          ] as const,
        }),
      ).rejects.toMatchInlineSnapshot(`
        [ContractFunctionExecutionError: The contract function "transferFrom" reverted with the following reason:
        ERC721: transfer caller is not owner nor approved

        Contract Call:
          address:   0x0000000000000000000000000000000000000000
          function:  transferFrom(address from, address to, uint256 tokenId)
          args:                  (0xd8da6bf26964af9d7eed9e03e53415d37aa96045, 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266, 1)

        Docs: https://viem.sh/docs/contract/multicall.html
        Version: viem@1.0.2]
      `)
    })
  })

  test('contract revert: error not found on abi', async () => {
    const { contractAddress } = await deployErrorExample()

    const abi = errorsExampleABI.filter(
      (abiItem) => abiItem.name !== 'SimpleError',
    )

    await expect(() =>
      multicall(publicClient, {
        allowFailure: false,
        blockNumber: forkBlockNumber,
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

      Docs: https://viem.sh/docs/contract/decodeErrorResult.html
      Version: viem@1.0.2]
    `)
  })
})

test('chain not provided', async () => {
  await expect(() =>
    multicall(
      createPublicClient({
        transport: http(localHttpUrl),
      }),
      {
        blockNumber: forkBlockNumber,
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
    '"client chain not configured. multicallAddress is required."',
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
        transport: http(localHttpUrl),
      }),
      {
        blockNumber: forkBlockNumber,
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
    "Chain \\"Ethereum\\" does not support contract \\"multicall3\\".

    This could be due to any of the following:
    - The chain does not have the contract \\"multicall3\\" configured.

    Version: viem@1.0.2"
  `)
})

test('multicall contract deployed on later block', async () => {
  await expect(() =>
    multicall(publicClient, {
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
    "Chain \\"Localhost\\" does not support contract \\"multicall3\\".

    This could be due to any of the following:
    - The contract \\"multicall3\\" was not deployed until block 14353601 (current block 69420).

    Version: viem@1.0.2"
  `)
})

test('batchSize on client', async () => {
  const client = createPublicClient({
    batch: {
      multicall: {
        batchSize: 1024,
      },
    },
    chain: anvilChain,
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
  test('https://github.com/wagmi-dev/viem/issues/434', async () => {
    const { contractAddress } = await deploy({
      abi: gh434ABI,
      bytecode: gh434.bytecode.object as Hex,
      account: accounts[0].address,
    })

    expect(
      await multicall(publicClient, {
        allowFailure: false,
        blockNumber: forkBlockNumber,
        contracts: [
          {
            abi: gh434ABI,
            address: contractAddress!,
            functionName: 'foo',
          },
          {
            abi: gh434ABI,
            address: contractAddress!,
            functionName: 'bar',
          },
          {
            abi: gh434ABI,
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
