import * as Abi from 'ox/Abi'
import * as Value from 'ox/Value'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import { expect, test } from 'vitest'

import { Actions, Client, custom, publicActions } from 'viem'

const client = anvil.getClient(anvil.mainnet)

const a = constants.accounts[0].address
const b = constants.accounts[1].address
const c = constants.accounts[2].address

const wagmiAbi = Abi.from([
  'function mint()',
  'function mint(uint256 tokenId)',
  'function name() view returns (string)',
])
const wagmiAddress = '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2'
const usdcAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'

const maxUint256 = 2n ** 256n - 1n

test('simulates calls across blocks', async () => {
  const result = await Actions.block.simulate(client, {
    blocks: [
      {
        calls: [
          {
            account: a,
            to: b,
            value: Value.fromEther('1'),
          },
          {
            account: a,
            to: c,
            value: Value.fromEther('1'),
          },
          {
            abi: wagmiAbi,
            functionName: 'name',
            to: wagmiAddress,
          },
        ],
        stateOverride: {
          [a]: { balance: Value.fromEther('10000') },
        },
      },
    ],
  })

  expect(result[0]!.calls).toMatchInlineSnapshot(`
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
  const result = await Actions.block.simulate(client, {
    blocks: [
      {
        blockOverrides: {
          baseFeePerGas: Value.fromGwei('100'),
          gasLimit: 60_000_000n,
        },
        calls: [
          {
            account: a,
            to: b,
            value: Value.fromEther('1'),
          },
        ],
        stateOverride: {
          [a]: { balance: Value.fromEther('10000') },
        },
      },
    ],
  })

  expect(result[0]!.baseFeePerGas).toBe(Value.fromGwei('100'))
  expect(result[0]!.gasLimit).toBe(60_000_000n)
})

test('behavior: fee cap too high', async () => {
  await expect(
    Actions.block.simulate(client, {
      blocks: [
        {
          calls: [
            {
              account: a,
              maxFeePerGas: maxUint256 + 1n,
              to: b,
              value: Value.fromEther('1'),
            },
          ],
        },
      ],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [RpcError.ExecutionError: The fee cap (\`maxFeePerGas\` = 115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei) cannot be higher than the maximum allowed value (2^256-1).

    Request Arguments:


    Details: The fee cap (\`maxFeePerGas\` = 115792089237316195423570985008687907853269984665640564039457584007913.129639936 gwei) cannot be higher than the maximum allowed value (2^256-1).
    Version: viem@2.52.1]
  `)
})

test('behavior: tip higher than fee cap', async () => {
  await expect(
    Actions.block.simulate(client, {
      blocks: [
        {
          calls: [
            {
              account: a,
              maxFeePerGas: Value.fromGwei('10'),
              maxPriorityFeePerGas: Value.fromGwei('11'),
              to: b,
              value: Value.fromEther('1'),
            },
          ],
        },
      ],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [RpcError.ExecutionError: The provided tip (\`maxPriorityFeePerGas\` = 11 gwei) cannot be higher than the fee cap (\`maxFeePerGas\` = 10 gwei).

    Request Arguments:


    Details: The provided tip (\`maxPriorityFeePerGas\` = 11 gwei) cannot be higher than the fee cap (\`maxFeePerGas\` = 10 gwei).
    Version: viem@2.52.1]
  `)
})

test('behavior: gas too low', async () => {
  await expect(
    Actions.block.simulate(client, {
      blocks: [
        {
          calls: [
            {
              account: a,
              gas: 100n,
              to: b,
              value: Value.fromEther('1'),
            },
          ],
          stateOverride: {
            [a]: { balance: Value.fromEther('10000') },
          },
        },
      ],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [RpcError.ExecutionError: The amount of gas provided for the transaction exceeds the limit allowed for the block.

    Request Arguments:


    Details: intrinsic gas too high -- CallGasCostMoreThanGasLimit
    Version: viem@2.52.1]
  `)
})

test('behavior: insufficient funds', async () => {
  await expect(
    Actions.block.simulate(client, {
      blocks: [
        {
          calls: [
            {
              account: '0x0000000000000000000000000000000000696969',
              to: b,
              value: Value.fromEther('1'),
            },
          ],
        },
      ],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [RpcError.ExecutionError: The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.

    This error could arise when the account does not have enough funds to:
     - pay for the total gas fee,
     - pay for the value to send.
     
    The cost of the transaction is calculated as \`gas * gas fee + value\`, where:
     - \`gas\` is the amount of gas needed for transaction to execute,
     - \`gas fee\` is the gas fee,
     - \`value\` is the amount of ether to send to the recipient.
     
    Request Arguments:


    Details: Insufficient funds for gas * price + value
    Version: viem@2.52.1]
  `)
})

test('behavior: contract function does not exist (abi call)', async () => {
  const result = await Actions.block.simulate(client, {
    blocks: [
      {
        calls: [
          {
            abi: wagmiAbi,
            functionName: 'mint',
            to: usdcAddress,
          },
        ],
        stateOverride: {
          [a]: { balance: Value.fromEther('10000') },
        },
      },
    ],
  })
  expect(result[0]!.calls).toMatchInlineSnapshot(`
    [
      {
        "data": "0x",
        "error": [ContractFunctionExecutionError: The contract function "mint" returned no data ("0x").

    This could be due to any of the following:
      - The contract does not have the function "mint",
      - The parameters passed to the contract function may be invalid, or
      - The address is not a contract.
     
    Contract Call:
      address:   0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
      function:  function mint()

    Details: Cannot decode zero data ("0x") with ABI parameters.
    Version: viem@2.52.1],
        "gasUsed": 28585n,
        "logs": [],
        "status": "failure",
      },
    ]
  `)
})

test('behavior: contract function does not exist (raw call)', async () => {
  const result = await Actions.block.simulate(client, {
    blocks: [
      {
        calls: [
          {
            data: '0xdeadbeef',
            to: wagmiAddress,
          },
        ],
        stateOverride: {
          [a]: { balance: Value.fromEther('10000') },
        },
      },
    ],
  })
  expect(result[0]!.calls).toMatchInlineSnapshot(`
    [
      {
        "data": "0x",
        "error": [ContractFunctionExecutionError: The contract function "<unknown>" returned no data ("0x").

    This could be due to any of the following:
      - The contract does not have the function "<unknown>",
      - The parameters passed to the contract function may be invalid, or
      - The address is not a contract.
     
    Contract Call:
      address:  0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2

    Details: Cannot decode zero data ("0x") with ABI parameters.
    Version: viem@2.52.1],
        "gasUsed": 21277n,
        "logs": [],
        "status": "failure",
      },
    ]
  `)
})

test('behavior: contract revert', async () => {
  const result = await Actions.block.simulate(client, {
    blocks: [
      {
        calls: [
          {
            abi: wagmiAbi,
            args: [1n],
            functionName: 'mint',
            to: wagmiAddress,
          },
        ],
        stateOverride: {
          [a]: { balance: Value.fromEther('10000') },
        },
      },
    ],
  })
  expect(result[0]!.calls).toMatchInlineSnapshot(`
    [
      {
        "data": "0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011546f6b656e2049442069732074616b656e000000000000000000000000000000",
        "error": [ContractFunctionExecutionError: The contract function "mint" reverted with the following reason:
    Token ID is taken

    Contract Call:
      address:   0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
      function:  function mint(uint256 tokenId)
      args:          (1)

    Details: An error occurred.

    Version: viem@2.52.1
    Version: viem@2.52.1],
        "gasUsed": 23813n,
        "logs": [],
        "status": "failure",
      },
    ]
  `)
})

test('behavior: decodes error from returnData when error field is absent', async () => {
  const canned = Client.create({
    chain: client.chain,
    transport: custom({
      async request({ method }: { method: string }) {
        if (method === 'eth_simulateV1')
          return [
            {
              baseFeePerGas: '0x1',
              blobGasUsed: '0x0',
              calls: [
                {
                  gasUsed: '0x5208',
                  logs: [],
                  returnData:
                    '0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011546f6b656e2049442069732074616b656e000000000000000000000000000000',
                  status: '0x0',
                },
              ],
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
              transactions: [],
              transactionsRoot:
                '0x0000000000000000000000000000000000000000000000000000000000000000',
              uncles: [],
              withdrawals: [],
              withdrawalsRoot:
                '0x0000000000000000000000000000000000000000000000000000000000000000',
            },
          ]
        return client.request({ method } as never)
      },
    }),
  })

  const result = await Actions.block.simulate(canned, {
    blocks: [
      {
        calls: [
          {
            abi: wagmiAbi,
            args: [1n],
            functionName: 'mint',
            to: wagmiAddress,
          },
        ],
      },
    ],
  })

  expect(result[0]!.calls[0]!.status).toBe('failure')
  expect(result[0]!.calls[0]!.error).toBeDefined()
  expect(result[0]!.calls[0]!.error?.message).toContain('Token ID is taken')
})

test('behavior: dataSuffix', async () => {
  const requests: unknown[] = []

  const proxy = Client.create({
    chain: client.chain,
    transport: custom({
      async request({ method, params }: { method: string; params: unknown }) {
        requests.push(params)
        return client.request({ method, params } as never)
      },
    }),
  })

  const result = await Actions.block.simulate(proxy, {
    blocks: [
      {
        calls: [
          {
            abi: wagmiAbi,
            dataSuffix: '0x1234',
            functionName: 'name',
            to: wagmiAddress,
          },
        ],
      },
    ],
  })

  expect(requests[0]).toMatchInlineSnapshot(`
    [
      {
        "blockStateCalls": [
          {
            "blockOverrides": undefined,
            "calls": [
              {
                "data": "0x06fdde031234",
                "from": undefined,
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
  expect(result[0]!.calls[0]!.result).toEqual('wagmi')
})

test('decorator', async () => {
  const decorated = client.extend(publicActions())
  const result = await decorated.block.simulate({
    blocks: [
      {
        calls: [
          {
            abi: wagmiAbi,
            functionName: 'name',
            to: wagmiAddress,
          },
        ],
      },
    ],
  })
  expect(result[0]!.calls[0]!.result).toEqual('wagmi')
})
