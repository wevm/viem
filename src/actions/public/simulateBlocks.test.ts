import { expect, test } from 'vitest'
import { usdcContractConfig, wagmiContractConfig } from '~test/abis.js'
import { anvilMainnet } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { createPublicClient } from '../../clients/createPublicClient.js'
import { custom } from '../../clients/transports/custom.js'
import { maxUint256 } from '../../constants/number.js'
import { parseEther, parseGwei } from '../../utils/index.js'
import { simulateBlocks } from './simulateBlocks.js'

const client = anvilMainnet.getClient()

test('default', async () => {
  const result = await simulateBlocks(client, {
    blocks: [
      {
        calls: [
          {
            account: accounts[0].address,
            to: accounts[1].address,
            value: parseEther('1'),
          },
          {
            account: accounts[0].address,
            to: accounts[2].address,
            value: parseEther('1'),
          },
          {
            abi: wagmiContractConfig.abi,
            functionName: 'name',
            to: wagmiContractConfig.address,
          },
        ],
        stateOverrides: [
          {
            address: accounts[0].address,
            balance: parseEther('10000'),
          },
        ],
      },
    ],
  })

  expect(result[0].calls).toMatchInlineSnapshot(`
    [
      {
        "data": "0x",
        "gasUsed": 21000n,
        "logs": [],
        "result": null,
        "status": "success",
      },
      {
        "data": "0x",
        "gasUsed": 21000n,
        "logs": [],
        "result": null,
        "status": "success",
      },
      {
        "data": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000057761676d69000000000000000000000000000000000000000000000000000000",
        "gasUsed": 24371n,
        "logs": [],
        "result": "wagmi",
        "status": "success",
      },
    ]
  `)
})

test('args: blockOverrides', async () => {
  const result = await simulateBlocks(client, {
    blocks: [
      {
        calls: [
          {
            account: accounts[0].address,
            to: accounts[1].address,
            value: parseEther('1'),
          },
        ],
        blockOverrides: {
          baseFeePerGas: parseGwei('100'),
          gasLimit: 60_000_000n,
        },
        stateOverrides: [
          {
            address: accounts[0].address,
            balance: parseEther('10000'),
          },
        ],
      },
    ],
  })

  expect(result[0].baseFeePerGas).toBe(parseGwei('100'))
  expect(result[0].gasLimit).toBe(60_000_000n)
})

test('behavior: fee cap too high', async () => {
  await expect(() =>
    simulateBlocks(client, {
      blocks: [
        {
          calls: [
            {
              account: accounts[0].address,
              to: accounts[1].address,
              value: parseEther('1'),
              maxFeePerGas: maxUint256 + 1n,
            },
          ],
        },
      ],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [FeeCapTooHighError: The fee cap (\`maxFeePerGas\` = 115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei) cannot be higher than the maximum allowed value (2^256-1).

    Version: viem@x.y.z]
  `)
})

test('behavior: tip higher than fee cap', async () => {
  await expect(() =>
    simulateBlocks(client, {
      blocks: [
        {
          calls: [
            {
              account: accounts[0].address,
              to: accounts[1].address,
              value: parseEther('1'),
              maxPriorityFeePerGas: parseGwei('11'),
              maxFeePerGas: parseGwei('10'),
            },
          ],
        },
      ],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `
    [TipAboveFeeCapError: The provided tip (\`maxPriorityFeePerGas\` = 11 gwei) cannot be higher than the fee cap (\`maxFeePerGas\` = 10 gwei).

    Version: viem@x.y.z]
  `,
  )
})

test('behavior: gas too low', async () => {
  await expect(() =>
    simulateBlocks(client, {
      blocks: [
        {
          calls: [
            {
              account: accounts[0].address,
              to: accounts[1].address,
              value: parseEther('1'),
              gas: 100n,
            },
          ],
          stateOverrides: [
            {
              address: accounts[0].address,
              balance: parseEther('10000'),
            },
          ],
        },
      ],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `
    [IntrinsicGasTooHighError: The amount of gas provided for the transaction exceeds the limit allowed for the block.

    Details: intrinsic gas too high -- CallGasCostMoreThanGasLimit
    Version: viem@x.y.z]
  `,
  )
})

test('behavior: insufficient funds', async () => {
  await expect(() =>
    simulateBlocks(client, {
      blocks: [
        {
          calls: [
            {
              account: '0x0000000000000000000000000000000000696969',
              to: accounts[1].address,
              value: parseEther('1'),
            },
          ],
        },
      ],
    }),
  ).rejects.toThrowError('Insufficient funds for gas * price + value')
})

test('behavior: contract function does not exist', async () => {
  const result = await simulateBlocks(client, {
    blocks: [
      {
        calls: [
          {
            abi: wagmiContractConfig.abi,
            functionName: 'mint',
            to: usdcContractConfig.address,
          },
        ],
        stateOverrides: [
          {
            address: accounts[0].address,
            balance: parseEther('10000'),
          },
        ],
      },
    ],
  })
  expect(result[0].calls).toMatchInlineSnapshot(
    `
    [
      {
        "data": "0x",
        "error": [ContractFunctionExecutionError: The contract function "mint" returned no data ("0x").

    This could be due to any of the following:
      - The contract does not have the function "mint",
      - The parameters passed to the contract function may be invalid, or
      - The address is not a contract.
     
    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  mint()

    Version: viem@x.y.z],
        "gasUsed": 28585n,
        "logs": [],
        "status": "failure",
      },
    ]
  `,
  )
})

test('behavior: contract function does not exist', async () => {
  const result = await simulateBlocks(client, {
    blocks: [
      {
        calls: [
          {
            data: '0xdeadbeef',
            to: wagmiContractConfig.address,
          },
        ],
        stateOverrides: [
          {
            address: accounts[0].address,
            balance: parseEther('10000'),
          },
        ],
      },
    ],
  })
  expect(result[0].calls).toMatchInlineSnapshot(
    `
    [
      {
        "data": "0x",
        "error": [ContractFunctionExecutionError: The contract function "<unknown>" returned no data ("0x").

    This could be due to any of the following:
      - The contract does not have the function "<unknown>",
      - The parameters passed to the contract function may be invalid, or
      - The address is not a contract.
     
    Contract Call:
      address:  0x0000000000000000000000000000000000000000

    Version: viem@x.y.z],
        "gasUsed": 21277n,
        "logs": [],
        "status": "failure",
      },
    ]
  `,
  )
})

test('behavior: contract revert', async () => {
  const result = await simulateBlocks(client, {
    blocks: [
      {
        calls: [
          {
            abi: wagmiContractConfig.abi,
            functionName: 'mint',
            to: wagmiContractConfig.address,
            args: [1n],
          },
        ],
        stateOverrides: [
          {
            address: accounts[0].address,
            balance: parseEther('10000'),
          },
        ],
      },
    ],
  })
  expect(result[0].calls).toMatchInlineSnapshot(
    `
    [
      {
        "data": "0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011546f6b656e2049442069732074616b656e000000000000000000000000000000",
        "error": [ContractFunctionExecutionError: The contract function "mint" reverted with the following reason:
    Token ID is taken

    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  mint(uint256 tokenId)
      args:          (1)

    Version: viem@x.y.z],
        "gasUsed": 23813n,
        "logs": [],
        "status": "failure",
      },
    ]
  `,
  )
})

test('behavior: decodes error from returnData when error field is absent', async () => {
  const mockClient = createPublicClient({
    chain: client.chain,
    transport: custom({
      async request({ method }) {
        if (method === 'eth_simulateV1') {
          return [
            {
              baseFeePerGas: '0x1',
              blobGasUsed: '0x0',
              difficulty: '0x0',
              excessBlobGas: '0x0',
              extraData: '0x',
              gasLimit: '0x1c9c380',
              gasUsed: '0x5208',
              hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
              logsBloom: '0x00',
              miner: '0x0000000000000000000000000000000000000000',
              mixHash:
                '0x0000000000000000000000000000000000000000000000000000000000000000',
              nonce: '0x0000000000000000',
              number: '0x1',
              parentHash:
                '0x0000000000000000000000000000000000000000000000000000000000000000',
              receiptsRoot:
                '0x0000000000000000000000000000000000000000000000000000000000000000',
              sha3Uncles:
                '0x0000000000000000000000000000000000000000000000000000000000000000',
              size: '0x0',
              stateRoot:
                '0x0000000000000000000000000000000000000000000000000000000000000000',
              timestamp: '0x0',
              totalDifficulty: '0x0',
              transactions: [],
              transactionsRoot:
                '0x0000000000000000000000000000000000000000000000000000000000000000',
              uncles: [],
              withdrawals: [],
              withdrawalsRoot:
                '0x0000000000000000000000000000000000000000000000000000000000000000',
              calls: [
                {
                  status: '0x0',
                  returnData:
                    '0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011546f6b656e2049442069732074616b656e000000000000000000000000000000',
                  gasUsed: '0x5208',
                  logs: [],
                },
              ],
            },
          ]
        }
        return client.request({ method } as any)
      },
    }),
  })

  const result = await simulateBlocks(mockClient, {
    blocks: [
      {
        calls: [
          {
            abi: wagmiContractConfig.abi,
            functionName: 'mint',
            to: wagmiContractConfig.address,
            args: [1n],
          },
        ],
      },
    ],
  })

  expect(result[0].calls[0].status).toBe('failure')
  expect(result[0].calls[0].error).toBeDefined()
  expect(result[0].calls[0].error?.message).toContain('Token ID is taken')
})

test('behavior: dataSuffix', async () => {
  const requests: unknown[] = []

  const client = anvilMainnet.getClient()

  const proxyClient = createPublicClient({
    chain: client.chain,
    transport: custom({
      async request({ method, params }) {
        requests.push(params)
        return client.request({ method, params })
      },
    }),
  })

  const result = await simulateBlocks(proxyClient, {
    blocks: [
      {
        calls: [
          {
            abi: wagmiContractConfig.abi,
            functionName: 'name',
            to: wagmiContractConfig.address,
            dataSuffix: '0x1234',
          },
        ],
      },
    ],
  })

  // validate that the dataSuffix is appended to the data in the request
  expect(requests[0]).toMatchInlineSnapshot(`
  [
  {
    "blockStateCalls": [
      {
        "blockOverrides": undefined,
        "calls": [
          {
            "data": "0x06fdde031234",
            "to": "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
          },
        ],
        "stateOverrides": undefined,
      },
    ],
    "returnFullTransactions": undefined,
    "traceTransfers": undefined,
    "validation": undefined,
  },
  "latest",
]
  `)

  // confirm that the result is still as expected
  expect(result[0].calls[0].result).toEqual('wagmi')
})
