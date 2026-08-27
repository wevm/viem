import { parseAbi } from 'abitype'
import { expect, onTestFinished, test } from 'vitest'
import {
  baycContractConfig,
  usdcContractConfig,
  wagmiContractConfig,
} from '~test/abis.js'
import { anvilMainnet } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { mainnet } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { custom } from '../../clients/transports/custom.js'
import { http } from '../../clients/transports/http.js'
import { erc20Abi, erc721Abi } from '../../constants/abis.js'
import { zeroAddress } from '../../constants/address.js'
import {
  concatHex,
  getContractAddress,
  numberToHex,
  pad,
  parseEther,
} from '../../utils/index.js'
import { mine } from '../test/mine.js'
import { getBlockNumber } from './getBlockNumber.js'
import { simulateCalls } from './simulateCalls.js'

const client = anvilMainnet.getClient()

const wethContractAddress =
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as const
const wethAbi = parseAbi(['function deposit() payable'])

const uniswapV2RouterAddress =
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' as const
const uniswapV2RouterAbi = parseAbi([
  'function swapExactETHForTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline) payable returns (uint256[] amounts)',
])

test('default', async () => {
  const { results } = await simulateCalls(client, {
    calls: [
      {
        abi: erc20Abi,
        functionName: 'name',
        to: usdcContractConfig.address,
      },
      {
        abi: erc20Abi,
        functionName: 'symbol',
        to: usdcContractConfig.address,
      },
      {
        abi: erc721Abi,
        functionName: 'name',
        to: baycContractConfig.address,
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

test('behavior: with mutation calls', async () => {
  const { results } = await simulateCalls(client, {
    account: accounts[0].address,
    calls: [
      {
        to: accounts[1].address,
        value: parseEther('1'),
      },
      {
        to: accounts[2].address,
        value: parseEther('1'),
      },
      {
        abi: wagmiContractConfig.abi,
        functionName: 'mint',
        to: wagmiContractConfig.address,
      },
    ],
    stateOverrides: [
      {
        address: accounts[0].address,
        balance: parseEther('10000'),
      },
    ],
  })

  expect(
    results.map((result) => ({ ...result, logs: null })),
  ).toMatchInlineSnapshot(`
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

// Every `traceAssetChanges` test below is skipped on the pinned Anvil. Tracing reads the
// account's ETH balance with a deployless call, which has no `to`, and Anvil rejects
// those in `eth_simulateV1` – `eip1559 transaction can't be built due to missing keys:
// ["to"]` – up to and including v1.7.1, the version CI pins. Fixed upstream by
// foundry-rs/foundry#15784, unreleased at the time of writing.
// TODO: Re-enable once the pinned Anvil includes foundry-rs/foundry#15784.
test.skip('behavior: with mutation calls + asset changes', async () => {
  const account = '0xdead000000000000000042069420694206942069' as const
  const { assetChanges, results } = await simulateCalls(client, {
    account,
    traceAssetChanges: true,
    calls: [
      {
        to: accounts[1].address,
        value: parseEther('1'),
      },
      {
        to: accounts[2].address,
        value: parseEther('1'),
      },
      {
        abi: wagmiContractConfig.abi,
        functionName: 'mint',
        to: wagmiContractConfig.address,
      },
      {
        abi: erc20Abi,
        functionName: 'transfer',
        to: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
        args: [accounts[1].address, parseEther('1')],
      },
    ],
    stateOverrides: [
      {
        address: account,
        balance: parseEther('10000'),
      },
    ],
  })

  expect(
    assetChanges.map((change) => ({
      ...change,
      value: { diff: change.value.diff },
    })),
  ).toMatchInlineSnapshot(`
    [
      {
        "token": {
          "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          "decimals": 18,
          "symbol": "ETH",
        },
        "value": {
          "diff": -2000000000000000000n,
        },
      },
      {
        "token": {
          "address": "0xfba3912ca04dd458c843e2ee08967fc04f3579c2",
          "decimals": 1,
          "symbol": "WAGMI",
        },
        "value": {
          "diff": 1n,
        },
      },
      {
        "token": {
          "address": "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
          "decimals": 18,
          "symbol": "SHIB",
        },
        "value": {
          "diff": -1000000000000000000n,
        },
      },
    ]
  `)
  expect(
    results.map((result) => ({ ...result, logs: null })),
  ).toMatchInlineSnapshot(`
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
      {
        "data": "0x0000000000000000000000000000000000000000000000000000000000000001",
        "gasUsed": 51859n,
        "logs": null,
        "result": true,
        "status": "success",
      },
    ]
  `)
})

test('behavior: mutation calls with insufficient balance', async () => {
  await expect(() =>
    simulateCalls(client, {
      account: '0x0000000000000000000000000000000000696969',
      calls: [
        {
          to: accounts[1].address,
          value: parseEther('1'),
        },
        {
          to: accounts[2].address,
          value: parseEther('1'),
        },
        {
          abi: wagmiContractConfig.abi,
          functionName: 'mint',
          to: wagmiContractConfig.address,
        },
      ],
    }),
  ).rejects.toThrowError(
    'The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.',
  )
})

test('behavior: contract function does not exist', async () => {
  const { results } = await simulateCalls(client, {
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
  })
  expect(results).toMatchInlineSnapshot(
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
  const { results } = await simulateCalls(client, {
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
  })
  expect(results).toMatchInlineSnapshot(
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
  const { results } = await simulateCalls(client, {
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
  })
  expect(results).toMatchInlineSnapshot(
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

test('behavior: stress', async () => {
  const calls = []
  for (let i = 0; i < 1_000; i++) {
    calls.push({
      abi: erc20Abi,
      functionName: 'name',
      to: usdcContractConfig.address,
    })
  }

  await simulateCalls(client, {
    calls,
  })
})

test('behavior: traceAssetChanges uses the client block tag', async () => {
  const requests: { method: string; params?: any }[] = []
  const mainnetClient = createClient({ chain: mainnet, transport: http() })
  const client_ = createClient({
    chain: mainnet,
    experimental_blockTag: 'finalized',
    transport: custom({
      async request(args) {
        requests.push(args as any)
        return mainnetClient.request(args as any)
      },
    }),
  })

  const { assetChanges } = await simulateCalls(client_, {
    account: zeroAddress,
    calls: [
      {
        data: '0x1234',
        to: '0x0000000000000000000000000000000000000004',
      },
    ],
    traceAssetChanges: true,
  })

  expect(
    requests.find(({ method }) => method === 'eth_getBlockByNumber')?.params,
  ).toEqual(['finalized', false])
  const simulationBlocks = requests
    .filter(({ method }) => method === 'eth_simulateV1')
    .map(({ params }) => params[1])
  expect(simulationBlocks).toHaveLength(2)
  expect(new Set(simulationBlocks).size).toBe(1)
  expect(simulationBlocks[0]).toMatch(/^0x[\da-f]+$/)
  expect(
    requests
      .filter(({ method }) => method === 'eth_call')
      .every(({ params }) => params[1] === simulationBlocks[0]),
  ).toBe(true)
  expect(assetChanges[0]?.value.diff).toBe(0n)
})

test('behavior: traceAssetChanges resolves the latest block once', async () => {
  const requests: { method: string; params?: any }[] = []
  const mainnetClient = createClient({ chain: mainnet, transport: http() })
  const client_ = createClient({
    chain: mainnet,
    transport: custom({
      async request(args) {
        requests.push(args as any)
        return mainnetClient.request(args as any)
      },
    }),
  })

  await simulateCalls(client_, {
    account: zeroAddress,
    calls: [{ to: zeroAddress }],
    traceAssetChanges: true,
  })

  expect(
    requests.filter(({ method }) => method === 'eth_blockNumber'),
  ).toHaveLength(1)
  const simulationBlocks = requests
    .filter(({ method }) => method === 'eth_simulateV1')
    .map(({ params }) => params[1])
  expect(simulationBlocks).toHaveLength(2)
  expect(new Set(simulationBlocks).size).toBe(1)
  expect(simulationBlocks[0]).toMatch(/^0x[\da-f]+$/)
  expect(
    requests
      .filter(({ method }) => method === 'eth_call')
      .map(({ params }) => params[1]),
  ).toEqual([simulationBlocks[0]])
})

test('behavior: traceAssetChanges rejects an unresolved block tag', async () => {
  const mainnetClient = createClient({ chain: mainnet, transport: http() })
  const client_ = createClient({
    chain: mainnet,
    transport: custom({
      async request(args) {
        const result = await mainnetClient.request(args as any)
        if (args.method === 'eth_getBlockByNumber')
          return { ...(result as any), number: null }
        return result
      },
    }),
  })

  await expect(
    simulateCalls(client_, {
      account: zeroAddress,
      blockTag: 'safe',
      calls: [{ to: zeroAddress }],
      traceAssetChanges: true,
    }),
  ).rejects.toThrow('Block tag `safe` did not resolve to a number.')
})

test('behavior: traceAssetChanges preserves the pending block tag', async () => {
  const requests: { method: string; params?: any }[] = []
  const mainnetClient = createClient({ chain: mainnet, transport: http() })
  const client_ = createClient({
    chain: mainnet,
    transport: custom({
      async request(args) {
        requests.push(args as any)
        return mainnetClient.request(args as any)
      },
    }),
  })

  const { assetChanges } = await simulateCalls(client_, {
    account: zeroAddress,
    blockTag: 'pending',
    calls: [{ to: zeroAddress }],
    traceAssetChanges: true,
  })

  expect(
    requests
      .filter(({ method }) => method === 'eth_simulateV1')
      .map(({ params }) => params[1]),
  ).toEqual(['pending', 'pending'])
  expect(
    requests
      .filter(({ method }) => method === 'eth_call')
      .map(({ params }) => params[1]),
  ).toEqual(['pending'])
  expect(assetChanges[0]?.value.diff).toBe(0n)
})

test('behavior: traceAssetChanges uses an explicit block number over the client block tag', async () => {
  const client_ = createClient({
    chain: mainnet,
    experimental_blockTag: 'pending',
    transport: http(),
  })

  const { assetChanges } = await simulateCalls(client_, {
    account: zeroAddress,
    blockNumber: 22_263_623n,
    calls: [
      {
        data: '0x1234',
        to: '0x0000000000000000000000000000000000000004',
      },
    ],
    traceAssetChanges: true,
  })

  expect(assetChanges.map((change) => change.token.address)).toEqual([
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  ])
})

test('behavior: traceAssetChanges ignores malformed candidate responses', async () => {
  const client_ = createClient({
    chain: mainnet,
    transport: http(),
  })

  const { assetChanges } = await simulateCalls(client_, {
    account: zeroAddress,
    blockNumber: 22_263_623n,
    calls: [
      {
        // The identity precompile returns the `balanceOf` calldata unchanged, which is
        // successful but not a valid ABI-encoded uint256.
        data: '0x1234',
        to: '0x0000000000000000000000000000000000000004',
      },
    ],
    traceAssetChanges: true,
  })

  expect(assetChanges.map((change) => change.token.address)).toEqual([
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  ])
})

test('behavior: traceAssetChanges isolates candidate balance reads', async () => {
  const client_ = createClient({ chain: mainnet, transport: http() })
  const target = '0x3000000000000000000000000000000000000003'

  const { assetChanges, results } = await simulateCalls(client_, {
    account: zeroAddress,
    blockNumber: 22_263_623n,
    calls: [{ data: '0x1234', to: target }],
    stateOverrides: [
      {
        address: target,
        // Increment slot zero and return its previous value on every call.
        code: '0x5f54806001015f555f5260205ff3',
      },
    ],
    traceAssetChanges: true,
  })

  expect(results[0]).toMatchObject({
    data: `0x${'0'.repeat(64)}`,
    status: 'success',
  })
  expect(assetChanges.map((change) => change.token.address)).toEqual([
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  ])
})

test('behavior: traceAssetChanges isolates invalid opcode balance reads', async () => {
  const client_ = createClient({ chain: mainnet, transport: http() })
  const target = '0x7000000000000000000000000000000000000007'

  const { assetChanges, results } = await simulateCalls(client_, {
    account: zeroAddress,
    blockNumber: 22_263_623n,
    calls: [{ data: '0x1234', to: target }],
    stateOverrides: [
      {
        address: target,
        // Succeed for the simulated call, but execute INVALID for balanceOf(address).
        code: '0x5f3560e01c6370a0823114600f57005bfe',
      },
    ],
    traceAssetChanges: true,
  })

  expect(results[0]?.status).toBe('success')
  expect(assetChanges.map((change) => change.token.address)).toEqual([
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  ])
})

test('behavior: traceAssetChanges omits assets without a pre-balance', async () => {
  const client_ = createClient({ chain: mainnet, transport: http() })
  const target = '0x8000000000000000000000000000000000000008'

  const { assetChanges, results } = await simulateCalls(client_, {
    account: zeroAddress,
    blockNumber: 22_263_623n,
    calls: [{ data: '0x1234', to: target }],
    stateOverrides: [
      {
        address: target,
        // Revert balanceOf before the call; enable it after the call writes slot zero.
        code: '0x5f3560e01c6370a082311460135760015f55005b5f541560225760015f5260205ff35b5f5ffd',
      },
    ],
    traceAssetChanges: true,
  })

  expect(results[0]?.status).toBe('success')
  expect(assetChanges.map((change) => change.token.address)).toEqual([
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  ])
})

test('behavior: traceAssetChanges omits unavailable token metadata', async () => {
  const client_ = createClient({ chain: mainnet, transport: http() })
  const target = '0x8100000000000000000000000000000000000008'

  const { assetChanges } = await simulateCalls(client_, {
    account: zeroAddress,
    blockNumber: 22_263_623n,
    calls: [{ data: '0x1234', to: target }],
    stateOverrides: [
      {
        address: target,
        // Return one only for balanceOf; return empty data for metadata calls.
        code: '0x5f3560e01c6370a0823114600f57005b60015f5260205ff3',
      },
    ],
    traceAssetChanges: true,
  })

  expect(
    assetChanges.find((change) => change.token.address === target),
  ).toEqual({
    token: { address: target, decimals: undefined, symbol: undefined },
    value: { diff: 0n, post: 1n, pre: 1n },
  })
})

test('behavior: traceAssetChanges rethrows balance transport errors', async () => {
  const mainnetClient = createClient({ chain: mainnet, transport: http() })
  const client_ = createClient({
    chain: mainnet,
    transport: custom({
      async request(args) {
        if (args.method === 'eth_call')
          throw new Error('Balance transport error')
        return mainnetClient.request(args as any)
      },
    }),
  })

  await expect(
    simulateCalls(client_, {
      account: zeroAddress,
      blockNumber: 22_263_623n,
      calls: [{ to: zeroAddress }],
      traceAssetChanges: true,
    }),
  ).rejects.toThrow('Balance transport error')
})

test('behavior: traceAssetChanges uses consistent balance probe callers', async () => {
  const client_ = createClient({ chain: mainnet, transport: http() })
  const target = '0x3000000000000000000000000000000000000003'

  const { assetChanges } = await simulateCalls(client_, {
    account: zeroAddress,
    blockNumber: 22_263_623n,
    calls: [{ data: '0x1234', to: target }],
    stateOverrides: [
      {
        address: target,
        // Return msg.sender as the balance.
        code: '0x335f5260205ff3',
      },
    ],
    traceAssetChanges: true,
  })

  expect(
    assetChanges.find((change) => change.token.address === target)?.value,
  ).toEqual({
    diff: 0n,
    post: 0x00000000000000000000000000000000deadbeefn,
    pre: 0x00000000000000000000000000000000deadbeefn,
  })
})

test('behavior: traceAssetChanges does not replace caller state overrides', async () => {
  const client_ = createClient({ chain: mainnet, transport: http() })
  const staticCallAddress = '0x00000000000000000000000000000000deadbeef'
  const target = '0x9000000000000000000000000000000000000009'

  const { assetChanges } = await simulateCalls(client_, {
    account: zeroAddress,
    blockNumber: 22_263_623n,
    calls: [{ data: '0x1234', to: target }],
    stateOverrides: [
      { address: staticCallAddress, code: '0x00' },
      { address: target, code: '0x335f5260205ff3' },
    ],
    traceAssetChanges: true,
  })

  expect(
    assetChanges.find((change) => change.token.address === target)?.value,
  ).toEqual({
    diff: 0n,
    post: 0x00000000000000000000000000000000deadbef0n,
    pre: 0x00000000000000000000000000000000deadbef0n,
  })
})

test('behavior: traceAssetChanges handles uppercase new-token logs', async () => {
  const mainnetClient = createClient({ chain: mainnet, transport: http() })
  const client_ = createClient({
    chain: mainnet,
    transport: custom({
      async request(args) {
        const result = await mainnetClient.request(args as any)
        if (args.method === 'eth_simulateV1')
          for (const block of result as any)
            for (const call of block.calls)
              for (const log of call.logs ?? [])
                log.topics = log.topics.map(
                  (topic: string) => `0x${topic.slice(2).toUpperCase()}`,
                )
        return result
      },
    }),
  })
  const account = '0x1000000000000000000000000000000000000001'
  const factory = '0x2000000000000000000000000000000000000002'
  const token = getContractAddress({ from: factory, nonce: 0n })
  const bytecode = concatHex([
    '0x60016000527f',
    pad(account, { size: 32 }),
    '0x60007fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    // Emit `Transfer(0, account, 1)`, then deploy runtime code that returns uint256(1).
    '0x60206000a3600a605a600039600a6000f3600160005260206000f3',
  ])

  const { assetChanges } = await simulateCalls(client_, {
    account,
    blockNumber: 22_263_623n,
    calls: [{ data: bytecode, to: factory }],
    stateOverrides: [
      { address: account, balance: parseEther('1') },
      {
        address: factory,
        // Deploy long calldata with CREATE; return empty for asset probe calls.
        code: '0x60403611600a575f5ff35b3660006000373660006000f060005260206000f3',
        nonce: 0,
      },
    ],
    traceAssetChanges: true,
  })

  expect(
    assetChanges.find((change) => change.token.address === token.toLowerCase()),
  ).toEqual({
    token: { address: token.toLowerCase(), decimals: 1, symbol: undefined },
    value: { diff: 1n, post: 1n, pre: 0n },
  })
})

test('behavior: traceAssetChanges ignores unrelated and native transfer logs', async () => {
  const requests = { simulations: 0 }
  const mainnetClient = createClient({ chain: mainnet, transport: http() })
  const client_ = createClient({
    chain: mainnet,
    transport: custom({
      async request(args) {
        const result = await mainnetClient.request(args as any)
        if (args.method === 'eth_simulateV1' && requests.simulations++ === 0)
          delete (result as any)[0].calls[2].logs
        return result
      },
    }),
  })
  const account = '0x1000000000000000000000000000000000000001'
  const logger = '0x8200000000000000000000000000000000000008'
  const recipient = '0x8300000000000000000000000000000000000008'

  const { assetChanges } = await simulateCalls(client_, {
    account,
    blockNumber: 22_263_623n,
    calls: [{ to: logger }, { to: recipient, value: 1n }, { to: zeroAddress }],
    stateOverrides: [
      { address: account, balance: parseEther('1') },
      { address: logger, code: '0x60006000a000' },
    ],
    traceAssetChanges: true,
    traceTransfers: true,
  })

  expect(assetChanges.map((change) => change.token.address)).toEqual([
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  ])
})

test('behavior: traceAssetChanges traces ERC721 metadata', async () => {
  const client_ = createClient({ chain: mainnet, transport: http() })
  const owner = '0xf7801B8115f3Fe46AC55f8c0Fdb5243726bdb66A'

  const { assetChanges, results } = await simulateCalls(client_, {
    account: owner,
    blockNumber: 22_263_623n,
    calls: [
      {
        abi: erc721Abi,
        functionName: 'transferFrom',
        args: [owner, '0x000000000000000000000000000000000000dEaD', 0n],
        to: baycContractConfig.address,
      },
    ],
    stateOverrides: [{ address: owner, balance: parseEther('1') }],
    traceAssetChanges: true,
  })

  expect(results[0]?.status).toBe('success')
  expect(
    assetChanges.find(
      (change) => change.token.address === baycContractConfig.address,
    ),
  ).toMatchObject({
    token: { decimals: 1, symbol: 'BAYC' },
    value: { diff: -1n },
  })
})

// TODO: Re-enable once the pinned Anvil includes foundry-rs/foundry#15784.
test.skip('behavior: traceAssetChanges with a call that reverts in isolation', async () => {
  // `accounts[0]` holds no USDC, so this transfer reverts. Asset discovery must not
  // abort the whole action over it — the revert belongs in `results`.
  const { assetChanges, results } = await simulateCalls(client, {
    account: accounts[0].address,
    traceAssetChanges: true,
    calls: [
      {
        abi: erc20Abi,
        functionName: 'transfer',
        to: usdcContractConfig.address,
        args: [accounts[1].address, 1_000_000n],
      },
    ],
  })

  expect(results[0]!.status).toBe('failure')
  expect(assetChanges).toMatchInlineSnapshot(`
    [
      {
        "token": {
          "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          "decimals": 18,
          "symbol": "ETH",
        },
        "value": {
          "diff": 0n,
          "post": 10000000000000000000000n,
          "pre": 10000000000000000000000n,
        },
      },
      {
        "token": {
          "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          "decimals": 6,
          "symbol": "USDC",
        },
        "value": {
          "diff": 0n,
          "post": 0n,
          "pre": 0n,
        },
      },
    ]
  `)
})

// TODO: Re-enable once the pinned Anvil includes foundry-rs/foundry#15784.
test.skip('behavior: traceAssetChanges with a call that depends on an earlier call', async () => {
  // The transfer only succeeds because the deposit ran first. Discovering assets by
  // replaying each call against pre-state independently cannot see that.
  const { assetChanges, results } = await simulateCalls(client, {
    account: accounts[0].address,
    traceAssetChanges: true,
    calls: [
      {
        abi: wethAbi,
        functionName: 'deposit',
        to: wethContractAddress,
        value: parseEther('1'),
      },
      {
        abi: erc20Abi,
        functionName: 'transfer',
        to: wethContractAddress,
        args: [accounts[1].address, parseEther('0.4')],
      },
    ],
  })

  expect(results.map((result) => result.status)).toEqual(['success', 'success'])
  expect(
    assetChanges.map((change) => ({
      symbol: change.token.symbol,
      diff: change.value.diff,
      pre: change.value.pre,
    })),
  ).toMatchInlineSnapshot(`
    [
      {
        "diff": -1000000000000000000n,
        "pre": 10000000000000000000000n,
        "symbol": "ETH",
      },
      {
        "diff": 600000000000000000n,
        "pre": 0n,
        "symbol": "WETH",
      },
    ]
  `)
})

// TODO: Re-enable once the pinned Anvil includes foundry-rs/foundry#15784.
test.skip('behavior: traceAssetChanges discovers a token not named by any call', async () => {
  // Swapping ETH for USDC through the Uniswap V2 router: the only `to` is the router,
  // and USDC is reachable only from the logs of the simulated batch.
  const { assetChanges } = await simulateCalls(client, {
    account: accounts[0].address,
    traceAssetChanges: true,
    calls: [
      {
        abi: uniswapV2RouterAbi,
        functionName: 'swapExactETHForTokens',
        to: uniswapV2RouterAddress,
        args: [
          0n,
          [wethContractAddress, usdcContractConfig.address],
          accounts[0].address,
          99999999999n,
        ],
        value: parseEther('1'),
      },
    ],
  })

  const usdc = assetChanges.find(
    (change) => change.token.address === usdcContractConfig.address,
  )
  expect(usdc?.token.symbol).toBe('USDC')
  expect(usdc?.value.diff).toBeGreaterThan(0n)
})

// TODO: Re-enable once the pinned Anvil includes foundry-rs/foundry#15784.
test.skip('behavior: traceAssetChanges asset discovery uses the requested block', async () => {
  const requests: { method: string; params?: any }[] = []
  const spyClient = createClient({
    chain: client.chain,
    transport: custom({
      async request(args) {
        requests.push(args as any)
        return client.request(args as any)
      },
    }),
  })

  // It has to be the fork head: anvil delegates pre-fork blocks to the upstream RPC,
  // which does not implement `eth_simulateV1`.
  const blockNumber = anvilMainnet.forkBlockNumber
  await simulateCalls(spyClient, {
    account: accounts[0].address,
    traceAssetChanges: true,
    blockNumber,
    calls: [
      {
        abi: erc20Abi,
        functionName: 'transfer',
        to: usdcContractConfig.address,
        args: [accounts[1].address, 1_000_000n],
      },
    ],
  })

  const blocksFor = (method: string) =>
    requests
      .filter((request) => request.method === method)
      .map((request) => request.params[1])

  // The discovery simulation and the result simulation.
  expect(blocksFor('eth_simulateV1')).toEqual([
    numberToHex(blockNumber),
    numberToHex(blockNumber),
  ])
})

// TODO: Re-enable once the pinned Anvil includes foundry-rs/foundry#15784.
test.skip('behavior: traceAssetChanges pins the base block when none is requested', async () => {
  const base = anvilMainnet.forkBlockNumber
  // This test mines, so restore the fork head for the tests that follow – including on
  // failure, so a mined block cannot leak into them.
  onTestFinished(() => anvilMainnet.restart())

  const requests: { method: string; params?: any }[] = []
  let advanced = false
  const spyClient = createClient({
    chain: client.chain,
    transport: custom({
      async request(args) {
        requests.push(args as any)
        const result = await client.request(args as any)
        // Advance the chain head between the two simulations. Discovery and measurement
        // are separate requests, so an unpinned measurement pass would follow the head
        // and measure balances against a block the token set was never computed on.
        if (args.method === 'eth_simulateV1' && !advanced) {
          advanced = true
          await mine(client, { blocks: 1 })
        }
        return result
      },
    }),
  })

  await simulateCalls(spyClient, {
    account: accounts[0].address,
    traceAssetChanges: true,
    calls: [
      {
        abi: erc20Abi,
        functionName: 'transfer',
        to: usdcContractConfig.address,
        args: [accounts[1].address, 1_000_000n],
      },
    ],
  })

  const blocksFor = (method: string) =>
    requests
      .filter((request) => request.method === method)
      .map((request) => request.params[1])

  // The head really did move, so the assertions below are not vacuous.
  expect(await getBlockNumber(client, { cacheTime: 0 })).toBe(base + 1n)

  // Both passes agree on the base, and neither followed the head.
  expect(blocksFor('eth_simulateV1')).toEqual([
    numberToHex(base),
    numberToHex(base),
  ])
})

test('behavior: account not provided with traceAssetChanges', async () => {
  await expect(() =>
    simulateCalls(client, {
      traceAssetChanges: true,
      calls: [
        {
          to: accounts[1].address,
          value: parseEther('1'),
        },
        {
          to: accounts[2].address,
          value: parseEther('1'),
        },
        {
          abi: wagmiContractConfig.abi,
          functionName: 'mint',
          to: wagmiContractConfig.address,
        },
        {
          abi: erc20Abi,
          functionName: 'transfer',
          to: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
          args: [accounts[1].address, parseEther('1')],
        },
      ],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    [BaseError: \`account\` is required when \`traceAssetChanges\` is true

    Version: viem@x.y.z]
  `)
})
