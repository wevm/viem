import { Abi, RpcResponse, Value } from 'ox'
import * as generated from '~contracts/generated.js'
import * as anvil from '~test/anvil.js'
import * as constants from '~test/constants.js'
import * as contract from '~test/contract.js'
import { expect, test } from 'vitest'

import { Actions, Client, custom, publicActions } from 'viem'

const client = anvil.getClient(anvil.mainnet)

const a = constants.accounts[0].address
const b = constants.accounts[1].address
const c = constants.accounts[2].address

const erc20Abi = Abi.from([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function transfer(address, uint256) returns (bool)',
])
const wagmiAbi = Abi.from([
  'function mint()',
  'function mint(uint256 tokenId)',
  'function name() view returns (string)',
])
const baycAddress = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D'
const usdcAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const wagmiAddress = '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2'

test('simulates a batch of reads', async () => {
  const { results } = await Actions.multicall(client, {
    calls: [
      {
        abi: erc20Abi,
        functionName: 'name',
        to: usdcAddress,
      },
      {
        abi: erc20Abi,
        functionName: 'symbol',
        to: usdcAddress,
      },
      {
        abi: erc20Abi,
        functionName: 'name',
        to: baycAddress,
      },
    ],
  })

  expect(results).toMatchInlineSnapshot(`
    [
      {
        "data": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000855534420436f696e000000000000000000000000000000000000000000000000",
        "gasUsed": 31414n,
        "logs": [],
        "result": "USD Coin",
        "status": "success",
      },
      {
        "data": "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000045553444300000000000000000000000000000000000000000000000000000000",
        "gasUsed": 31434n,
        "logs": [],
        "result": "USDC",
        "status": "success",
      },
      {
        "data": "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000011426f7265644170655961636874436c7562000000000000000000000000000000",
        "gasUsed": 24292n,
        "logs": [],
        "result": "BoredApeYachtClub",
        "status": "success",
      },
    ]
  `)
})

test('behavior: mutation calls', async () => {
  const { results } = await Actions.multicall(client, {
    account: a,
    calls: [
      {
        to: b,
        value: Value.fromEther('1'),
      },
      {
        to: c,
        value: Value.fromEther('1'),
      },
      {
        abi: wagmiAbi,
        functionName: 'mint',
        to: wagmiAddress,
      },
    ],
    stateOverride: {
      [a]: { balance: Value.fromEther('10000') },
    },
  })

  expect(results.map((result) => ({ ...result, logs: null })))
    .toMatchInlineSnapshot(`
      [
        {
          "data": "0x",
          "gasUsed": 21000n,
          "logs": null,
          "result": null,
          "status": "success",
        },
        {
          "data": "0x",
          "gasUsed": 21000n,
          "logs": null,
          "result": null,
          "status": "success",
        },
        {
          "data": "0x",
          "gasUsed": 78394n,
          "logs": null,
          "result": null,
          "status": "success",
        },
      ]
    `)
})

// TODO: Re-enable once anvil supports contract creation in `eth_simulateV1`
// (the native-balance probe deploys a helper contract).
test.skip('behavior: traceAssetChanges', async () => {
  const account = '0xdead000000000000000042069420694206942069' as const
  const { assetChanges } = await Actions.multicall(client, {
    account,
    calls: [
      {
        to: b,
        value: Value.fromEther('1'),
      },
      {
        abi: wagmiAbi,
        functionName: 'mint',
        to: wagmiAddress,
      },
    ],
    stateOverride: {
      [account]: { balance: Value.fromEther('10000') },
    },
    traceAssetChanges: true,
  })

  expect(assetChanges).toMatchInlineSnapshot()
})

test('behavior: mutation calls with insufficient balance', async () => {
  await expect(
    Actions.multicall(client, {
      account: '0x0000000000000000000000000000000000696969',
      calls: [
        {
          to: b,
          value: Value.fromEther('1'),
        },
      ],
    }),
  ).rejects.toThrowError(
    'The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.',
  )
})

test('behavior: contract function does not exist (abi call)', async () => {
  const { results } = await Actions.multicall(client, {
    calls: [
      {
        abi: wagmiAbi,
        functionName: 'mint',
        to: usdcAddress,
      },
    ],
  })
  expect(results).toMatchInlineSnapshot(`
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
  const { results } = await Actions.multicall(client, {
    calls: [
      {
        data: '0xdeadbeef',
        to: wagmiAddress,
      },
    ],
  })
  expect(results).toMatchInlineSnapshot(`
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
  const { results } = await Actions.multicall(client, {
    calls: [
      {
        abi: wagmiAbi,
        args: [1n],
        functionName: 'mint',
        to: wagmiAddress,
      },
    ],
  })
  expect(results).toMatchInlineSnapshot(`
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

test('behavior: stress (1000 calls)', async () => {
  const calls = []
  for (let i = 0; i < 1_000; i++)
    calls.push({
      abi: erc20Abi,
      functionName: 'name',
      to: usdcAddress,
    } as const)

  const { results } = await Actions.multicall(client, { calls })
  expect(results.length).toBe(1_000)
  expect(
    results.every(
      (result) => result.status === 'success' && result.result === 'USD Coin',
    ),
  ).toBe(true)
})

test('behavior: account not provided with traceAssetChanges', async () => {
  await expect(
    Actions.multicall(client, {
      calls: [
        {
          to: b,
          value: Value.fromEther('1'),
        },
      ],
      traceAssetChanges: true,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [BaseError: \`account\` is required when \`traceAssetChanges\` is true.

    Version: viem@2.52.1]
  `)
})

test('args: allowFailure (false returns bare results)', async () => {
  const results = await Actions.multicall(client, {
    allowFailure: false,
    calls: [
      {
        abi: erc20Abi,
        functionName: 'name',
        to: usdcAddress,
      },
      {
        abi: erc20Abi,
        functionName: 'symbol',
        to: usdcAddress,
      },
    ],
  })

  expect(results.results).toMatchInlineSnapshot(`
    [
      "USD Coin",
      "USDC",
    ]
  `)
})

test('args: allowFailure (false throws on first failure)', async () => {
  await expect(
    Actions.multicall(client, {
      allowFailure: false,
      calls: [
        {
          abi: wagmiAbi,
          args: [1n],
          functionName: 'mint',
          to: wagmiAddress,
        },
      ],
    }),
  ).rejects.toThrowError('Token ID is taken')
})

test('args: mode (multicall executes via aggregate3)', async () => {
  const requests: string[] = []

  const proxy = Client.create({
    chain: client.chain,
    transport: custom({
      async request({ method, params }: { method: string; params: unknown }) {
        requests.push(method)
        return client.request({ method, params })
      },
    }),
  })

  const { results, ...rest } = await Actions.multicall(proxy, {
    mode: 'multicall',
    calls: [
      {
        abi: erc20Abi,
        functionName: 'name',
        to: usdcAddress,
      },
      {
        abi: erc20Abi,
        functionName: 'symbol',
        to: usdcAddress,
      },
    ],
  })

  expect(requests).toMatchInlineSnapshot(`
    [
      "eth_call",
    ]
  `)
  expect(rest).toMatchInlineSnapshot(`{}`)
  expect(results).toMatchInlineSnapshot(`
    [
      {
        "error": undefined,
        "result": "USD Coin",
        "status": "success",
      },
      {
        "error": undefined,
        "result": "USDC",
        "status": "success",
      },
    ]
  `)
})

test('args: mode (multicall decodes failures)', async () => {
  const { results } = await Actions.multicall(client, {
    mode: 'multicall',
    calls: [
      {
        abi: wagmiAbi,
        args: [1n],
        functionName: 'mint',
        to: wagmiAddress,
      },
      {
        abi: erc20Abi,
        functionName: 'name',
        to: usdcAddress,
      },
    ],
  })

  expect(results).toMatchInlineSnapshot(`
    [
      {
        "error": [ContractFunctionExecutionError: The contract function "mint" reverted with the following reason:
    Token ID is taken

    Contract Call:
      address:   0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2
      function:  function mint(uint256 tokenId)
      args:          (1)

    Details: An error occurred.

    Version: viem@2.52.1
    Version: viem@2.52.1],
        "result": undefined,
        "status": "failure",
      },
      {
        "error": undefined,
        "result": "USD Coin",
        "status": "success",
      },
    ]
  `)
})

test('args: mode (multicall rejects value calls)', async () => {
  await expect(
    Actions.multicall(client, {
      mode: 'multicall',
      calls: [
        {
          to: b,
          value: Value.fromEther('1'),
        },
      ],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [BaseError: \`traceAssetChanges\`, \`traceTransfers\`, \`validation\`, and call \`value\` are not supported with \`mode: 'multicall'\`.

    Version: viem@2.52.1]
  `)
})

test('args: batchSize (chunks aggregate3 batches)', async () => {
  const requests: string[] = []

  const proxy = Client.create({
    chain: client.chain,
    transport: custom({
      async request({ method, params }: { method: string; params: unknown }) {
        requests.push(method)
        return client.request({ method, params })
      },
    }),
  })

  const calls = []
  for (let i = 0; i < 10; i++)
    calls.push({
      abi: erc20Abi,
      functionName: 'name',
      to: usdcAddress,
    } as const)

  const { results } = await Actions.multicall(proxy, {
    mode: 'multicall',
    batchSize: 64,
    calls,
  })

  expect(results.length).toBe(10)
  expect(
    results.every(
      (result) => result.status === 'success' && result.result === 'USD Coin',
    ),
  ).toBe(true)
  expect(
    requests.filter((method) => method === 'eth_call').length,
  ).toMatchInlineSnapshot(`1`)
})

test('args: deployless (multicall via bytecode)', async () => {
  const { results } = await Actions.multicall(client, {
    mode: 'multicall',
    calls: [
      {
        abi: erc20Abi,
        functionName: 'name',
        to: usdcAddress,
      },
    ],
    deployless: true,
  })

  expect(results).toMatchInlineSnapshot(`
    [
      {
        "error": undefined,
        "result": "USD Coin",
        "status": "success",
      },
    ]
  `)
})

test('behavior: auto mode falls back to aggregate3 and caches', async () => {
  const simulateAttempts: number[] = []
  let calls = 0

  const proxy = Client.create({
    chain: client.chain,
    transport: custom({
      async request({ method, params }: { method: string; params: unknown }) {
        calls++
        if (method === 'eth_simulateV1') {
          simulateAttempts.push(calls)
          throw new RpcResponse.MethodNotFoundError()
        }
        return client.request({ method, params })
      },
    }),
  })

  const first = await Actions.multicall(proxy, {
    calls: [
      {
        abi: erc20Abi,
        functionName: 'name',
        to: usdcAddress,
      },
    ],
  })

  expect(simulateAttempts.length).toBe(1)
  expect('block' in first).toBe(false)
  expect(first.results).toMatchInlineSnapshot(`
    [
      {
        "error": undefined,
        "result": "USD Coin",
        "status": "success",
      },
    ]
  `)

  // Second batch skips the eth_simulateV1 attempt (cached per client).
  const second = await Actions.multicall(proxy, {
    calls: [
      {
        abi: erc20Abi,
        functionName: 'symbol',
        to: usdcAddress,
      },
    ],
  })

  expect(simulateAttempts.length).toBe(1)
  expect(second.results[0]).toMatchInlineSnapshot(`
    {
      "error": undefined,
      "result": "USDC",
      "status": "success",
    }
  `)
})

test('behavior: simulate pin throws on unsupported nodes', async () => {
  const proxy = Client.create({
    chain: client.chain,
    transport: custom({
      async request({ method, params }: { method: string; params: unknown }) {
        if (method === 'eth_simulateV1')
          throw new RpcResponse.MethodNotFoundError()
        return client.request({ method, params })
      },
    }),
  })

  await expect(
    Actions.multicall(proxy, {
      mode: 'simulate',
      calls: [
        {
          abi: erc20Abi,
          functionName: 'name',
          to: usdcAddress,
        },
      ],
    }),
  ).rejects.toThrowError()
})

test('behavior: forcing options disable the fallback', async () => {
  const proxy = Client.create({
    chain: client.chain,
    transport: custom({
      async request({ method, params }: { method: string; params: unknown }) {
        if (method === 'eth_simulateV1')
          throw new RpcResponse.MethodNotFoundError()
        return client.request({ method, params })
      },
    }),
  })

  await expect(
    Actions.multicall(proxy, {
      calls: [
        {
          abi: erc20Abi,
          functionName: 'name',
          to: usdcAddress,
        },
      ],
      traceTransfers: true,
    }),
  ).rejects.toThrowError()
})

test('behavior: simulateV1 path returns the simulated block', async () => {
  const result = await Actions.multicall(client, {
    calls: [
      {
        abi: erc20Abi,
        functionName: 'name',
        to: usdcAddress,
      },
    ],
  })

  expect(result.block).toBeDefined()
  expect(typeof result.block?.number).toBe('bigint')
})

test('decorator', async () => {
  const decorated = client.extend(publicActions())
  const { results } = await decorated.multicall({
    calls: [
      {
        abi: erc20Abi,
        functionName: 'name',
        to: usdcAddress,
      },
    ],
  })
  expect(results[0]!.status).toBe('success')
})

test('args: stateOverride (multicall mode)', async () => {
  const target = '0x00000000000000000000000000000000000cafe1'
  const { results } = await Actions.multicall(client, {
    mode: 'multicall',
    calls: [
      {
        abi: Abi.from([
          'function getEthBalance(address) view returns (uint256)',
        ]),
        args: [target],
        functionName: 'getEthBalance',
        to: '0xcA11bde05977b3631167028862bE2a173976CA11',
      },
    ],
    stateOverride: {
      [target]: { balance: Value.fromEther('420') },
    },
  })

  expect(results[0]).toMatchInlineSnapshot(`
    {
      "error": undefined,
      "result": 420000000000000000000n,
      "status": "success",
    }
  `)
})

test('behavior: client batch config supplies aggregate3 defaults', async () => {
  const requests: { method: string; params: unknown }[] = []

  const configured = Client.create({
    batch: { multicall: { deployless: true } },
    chain: client.chain,
    transport: custom({
      async request({ method, params }: { method: string; params: unknown }) {
        requests.push({ method, params })
        return client.request({ method, params })
      },
    }),
  })

  const { results } = await Actions.multicall(configured, {
    mode: 'multicall',
    calls: [
      {
        abi: erc20Abi,
        functionName: 'name',
        to: usdcAddress,
      },
    ],
  })

  expect(results[0]!.status).toBe('success')
  // Deployless multicall executes as a to-less bytecode call.
  const [call] = requests[0]!.params as [{ to?: string }]
  expect(call.to).toBeUndefined()
})

test('behavior: chainless client falls back to a deployless multicall', async () => {
  const chainless = Client.create({
    transport: custom({
      async request({ method, params }: { method: string; params: unknown }) {
        return client.request({ method, params })
      },
    }),
  })

  const { results } = await Actions.multicall(chainless, {
    mode: 'multicall',
    calls: [
      {
        abi: erc20Abi,
        functionName: 'name',
        to: usdcAddress,
      },
    ],
  })

  expect(results[0]).toMatchInlineSnapshot(`
    {
      "error": undefined,
      "result": "USD Coin",
      "status": "success",
    }
  `)
})

test('behavior: encode failure keeps result ordering (multicall mode)', async () => {
  const { results } = await Actions.multicall(client, {
    mode: 'multicall',
    calls: [
      {
        abi: erc20Abi,
        args: [a, 1n],
        functionName: 'name',
        to: usdcAddress,
      },
      {
        abi: erc20Abi,
        functionName: 'name',
        to: usdcAddress,
      },
      {
        abi: erc20Abi,
        functionName: 'symbol',
        to: usdcAddress,
      },
    ],
  })

  expect(results.length).toBe(3)
  expect(results[0]!.status).toBe('failure')
  expect(results[0]!.error).toMatchInlineSnapshot(`
    [ContractFunctionExecutionError: ABI encoding parameters/values length mismatch.
    Expected length (parameters): 0
    Given length (values): 2

    Contract Call:
      address:   0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
      function:  function name() view returns (string)
      args:          (0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266, 1)

    Details: ABI encoding parameters/values length mismatch.
    Expected length (parameters): 0
    Given length (values): 2
    Version: viem@2.52.1]
  `)
  expect(results[1]).toMatchInlineSnapshot(`
    {
      "error": undefined,
      "result": "USD Coin",
      "status": "success",
    }
  `)
  expect(results[2]).toMatchInlineSnapshot(`
    {
      "error": undefined,
      "result": "USDC",
      "status": "success",
    }
  `)
})

test('args: allowFailure (false throws on first failure, multicall mode)', async () => {
  await expect(
    Actions.multicall(client, {
      allowFailure: false,
      mode: 'multicall',
      calls: [
        {
          abi: erc20Abi,
          functionName: 'name',
          to: '0x0000000000000000000000000000000000000000',
        },
        {
          abi: erc20Abi,
          functionName: 'name',
          to: usdcAddress,
        },
      ],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [ContractFunctionExecutionError: The contract function "name" returned no data ("0x").

    This could be due to any of the following:
      - The contract does not have the function "name",
      - The parameters passed to the contract function may be invalid, or
      - The address is not a contract.
     
    Contract Call:
      address:   0x0000000000000000000000000000000000000000
      function:  function name() view returns (string)

    Details: Cannot decode zero data ("0x") with ABI parameters.
    Version: viem@2.52.1]
  `)
})

test('behavior: contract revert with error not on abi (multicall mode)', async () => {
  const { address } = await contract.deploy(client, {
    bytecode: generated.ErrorsExample.bytecode.object,
  })

  const abi = generated.ErrorsExample.abi.filter(
    (abiItem) => !('name' in abiItem) || abiItem.name !== 'SimpleError',
  )

  const { results } = await Actions.multicall(client, {
    mode: 'multicall',
    calls: [
      {
        abi: erc20Abi,
        functionName: 'name',
        to: usdcAddress,
      },
      {
        abi,
        functionName: 'simpleCustomRead',
        to: address,
      },
    ],
  })

  expect(results[0]!.status).toBe('success')
  expect(results[1]!.status).toBe('failure')
  expect(results[1]!.error).toMatchInlineSnapshot(`
    [ContractFunctionExecutionError: The contract function "simpleCustomRead" reverted with the following signature:
    0xf9006398

    Unable to decode signature "0xf9006398" as it was not found on the provided ABI.
    Make sure you are using the correct ABI and that the error exists on it.
     
    Contract Call:
      address:   0xbb0368cecdcb0759a32abbc21583af992fe94dd7
      function:  function simpleCustomRead() pure

    Details: An error occurred.

    Version: viem@2.52.1
    Version: viem@2.52.1]
  `)
})

test('args: multicallAddress', async () => {
  const { results } = await Actions.multicall(client, {
    mode: 'multicall',
    calls: [
      {
        abi: erc20Abi,
        functionName: 'name',
        to: usdcAddress,
      },
    ],
    multicallAddress: '0xcA11bde05977b3631167028862bE2a173976CA11',
  })

  expect(results[0]).toMatchInlineSnapshot(`
    {
      "error": undefined,
      "result": "USD Coin",
      "status": "success",
    }
  `)
})

test('args: multicallAddress (invalid target fails the chunk)', async () => {
  const { results } = await Actions.multicall(client, {
    mode: 'multicall',
    calls: [
      {
        abi: erc20Abi,
        functionName: 'name',
        to: usdcAddress,
      },
      {
        abi: erc20Abi,
        functionName: 'symbol',
        to: usdcAddress,
      },
    ],
    // Not a multicall3 deployment; the aggregate3 request itself fails.
    multicallAddress: usdcAddress,
  })

  expect(results.length).toBe(2)
  expect(results.every((result) => result.status === 'failure')).toBe(true)
})
