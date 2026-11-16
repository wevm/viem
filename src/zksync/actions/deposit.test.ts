import { expect, test } from 'vitest'
import { anvilMainnet, anvilZksync } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { createRpcProxy } from '~test/utils.js'
import { mockRequestReturnData } from '~test/zksync.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import { mainnet, zksync } from '../../chains/index.js'
import { publicActions } from '../../clients/decorators/public.js'
import { erc20Abi } from '../../constants/abis.js'
import {
  type AbiFunction,
  createClient,
  type EncodeFunctionResultParameters,
  encodeFunctionResult,
  type Hex,
  http,
  parseAbi,
  toFunctionSelector,
} from '../../index.js'
import type { EIP1193RequestFn } from '../../types/eip1193.js'
import { wait } from '../../utils/wait.js'
import { bridgehubAbi } from '../../zksync/constants/abis.js'
import { legacyEthAddress } from '../../zksync/constants/address.js'
import { publicActionsL2 } from '../../zksync/decorators/publicL2.js'
import { deposit } from './deposit.js'

const request = (async ({ method, params }) => {
  if (method === 'eth_sendRawTransaction')
    return '0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87'
  if (method === 'eth_sendTransaction')
    return '0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87'
  if (method === 'eth_estimateGas') return 158774n
  if (method === 'eth_gasPrice') return 150_000_000n
  if (method === 'eth_maxPriorityFeePerGas') return 100_000_000n
  if (method === 'eth_call')
    return '0x00000000000000000000000070a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55'
  if (method === 'eth_getTransactionCount') return 1n
  if (method === 'eth_getBlockByNumber') return anvilMainnet.forkBlockNumber
  if (method === 'eth_chainId') return anvilMainnet.chain.id
  return anvilMainnet.getClient().request({ method, params } as any)
}) as EIP1193RequestFn

const baseClient = anvilMainnet.getClient({ batch: { multicall: false } })
baseClient.request = request
const client = baseClient.extend(publicActions)

const baseClientWithAccount = anvilMainnet.getClient({
  batch: { multicall: false },
  account: true,
})
baseClientWithAccount.request = request
const clientWithAccount = baseClientWithAccount.extend(publicActions)

const baseClientL2 = anvilZksync.getClient()
baseClientL2.request = (async ({ method, params }) => {
  if (method === 'eth_call')
    return '0x00000000000000000000000070a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55'
  if (method === 'eth_estimateGas') return 158774n
  return (
    (await mockRequestReturnData(method)) ??
    (await anvilZksync.getClient().request({ method, params } as any))
  )
}) as EIP1193RequestFn
const clientL2 = baseClientL2.extend(publicActionsL2())

test.skip('default', async () => {
  const account = privateKeyToAccount(accounts[0].privateKey)
  expect(
    deposit(client, {
      client: clientL2,
      account,
      token: legacyEthAddress,
      to: account.address,
      amount: 7_000_000_000n,
      refundRecipient: account.address,
    }),
  ).toBeDefined()
})

test('default: account hoisting', async () => {
  const account = privateKeyToAccount(accounts[0].privateKey)
  expect(
    deposit(clientWithAccount, {
      client: clientL2,
      token: legacyEthAddress,
      to: account.address,
      amount: 7_000_000_000n,
      refundRecipient: account.address,
    }),
  ).toBeDefined()
})

test('errors: no account provided', async () => {
  const account = privateKeyToAccount(accounts[0].privateKey)
  await expect(() =>
    deposit(client, {
      client: clientL2,
      token: legacyEthAddress,
      to: account.address,
      amount: 7_000_000_000n,
      refundRecipient: account.address,
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [AccountNotFoundError: Could not find an Account to execute with this Action.
      Please provide an Account with the \`account\` argument on the Action, or by supplying an \`account\` to the Client.

      Docs: https://viem.sh/docs/actions/wallet/sendTransaction
      Version: viem@x.y.z]
  `)
})

test('behavior: reads the bridge, fees, and token concurrently', async () => {
  const replies: Record<string, unknown> = {
    L1_NULLIFIER: '0xfb2fda7d9377f98a6cbd7a61c9f69575c8e947b6',
    assetId: `0x${'ab'.repeat(32)}`,
    baseToken: '0x0000000000000000000000000000000000000001',
    decimals: 6,
    l2TransactionBaseCost: 123_456_789n,
    name: 'USD Coin',
    nativeTokenVault: '0xec1d6d4a357bd65226eba599812ba4fda5514f47',
    symbol: 'USDC',
  }
  const functions = Object.fromEntries(
    [
      ...bridgehubAbi,
      ...erc20Abi,
      ...parseAbi([
        'function assetId(address token) view returns (bytes32)',
        'function L1_NULLIFIER() view returns (address)',
        'function nativeTokenVault() view returns (address)',
      ]),
    ]
      .map((item) => item as AbiFunction)
      .filter((fn) => fn.type === 'function' && fn.name in replies)
      .map((fn) => [toFunctionSelector(fn), fn]),
  )
  const responses: Record<string, unknown> = {
    eth_chainId: '0x1',
    eth_estimateGas: '0x30d40',
    eth_getBlockByNumber: {
      baseFeePerGas: '0x3b9aca00',
      difficulty: '0x0',
      extraData: '0x',
      gasLimit: '0x1c9c380',
      gasUsed: '0x0',
      hash: `0x${'11'.repeat(32)}`,
      logsBloom: `0x${'00'.repeat(256)}`,
      miner: `0x${'00'.repeat(20)}`,
      mixHash: `0x${'00'.repeat(32)}`,
      nonce: '0x0000000000000000',
      number: '0x112a880',
      parentHash: `0x${'22'.repeat(32)}`,
      receiptsRoot: `0x${'00'.repeat(32)}`,
      sha3Uncles: `0x${'00'.repeat(32)}`,
      size: '0x200',
      stateRoot: `0x${'00'.repeat(32)}`,
      timestamp: '0x6553f100',
      totalDifficulty: '0x0',
      transactions: [],
      transactionsRoot: `0x${'00'.repeat(32)}`,
      uncles: [],
    },
    eth_getTransactionCount: '0x7',
    eth_maxPriorityFeePerGas: '0x5f5e100',
    eth_sendRawTransaction: `0x${'cc'.repeat(32)}`,
    zks_estimateGasL1ToL2: '0x7a120',
    zks_getBridgeContracts: {
      l1Erc20DefaultBridge: '0x57891966931eb4bb6fb81430e6ce0a03aabde063',
      l1SharedDefaultBridge: '0xd7f9f54194c633f36ccd5f3da84ad4a1c38cb2cb',
      l2Erc20DefaultBridge: '0x11f943b2c77b743ab90f4a0ae7d5a4e7fca3e102',
      l2SharedDefaultBridge: '0x11f943b2c77b743ab90f4a0ae7d5a4e7fca3e102',
    },
    zks_getBridgehubContract: '0x303a465b659cbb0ab36ee643ea362c509eeb5213',
  }

  // Answers each request after 50ms, and groups the requests into rounds by
  // how many requests each one waited on in sequence.
  const rounds: string[][] = []
  const finished: number[] = [0]
  let transaction: unknown
  const url = await createRpcProxy(
    anvilMainnet.rpcUrl.http,
    async ({ method, params }) => {
      const fn =
        method === 'eth_call'
          ? functions[(params as [{ data: Hex }])[0].data.slice(0, 10)]!
          : undefined
      const depth = Math.max(...finished) + 1
      rounds[depth - 1] = [...(rounds[depth - 1] ?? []), fn?.name ?? method]
      await wait(50)
      finished.push(depth)
      if (method === 'eth_sendRawTransaction') transaction = params[0]
      if (method === 'eth_fillTransaction')
        return { error: { code: -32601, message: 'Method not found' } }
      if (fn)
        return {
          result: encodeFunctionResult({
            abi: [fn],
            functionName: fn.name,
            result: replies[fn.name],
          } as EncodeFunctionResultParameters),
        }
      return { result: responses[method] }
    },
  )

  const hash = await deposit(
    createClient({ chain: mainnet, transport: http(url) }),
    {
      account: privateKeyToAccount(accounts[0].privateKey),
      amount: 1_000_000n,
      client: createClient({ chain: zksync, transport: http(url) }),
      token: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    },
  )

  expect({ hash, transaction }).toMatchInlineSnapshot(`
    {
      "hash": "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
      "transaction": "0x02f902b501078405f5e100845f5e10008303a98094303a465b659cbb0ab36ee643ea362c509eeb521384075bcd15b9024424fd57fb0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000014400000000000000000000000000000000000000000000000000000000075bcd150000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007a12000000000000000000000000000000000000000000000000000000000000003200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d7f9f54194c633f36ccd5f3da84ad4a1c38cb2cb0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000c101abababababababababababababababababababababababababababababababab0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000f4240000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb4800000000000000000000000000000000000000000000000000000000000000c080a0d8cf95db4d162958b68f8ff0e6835f38d8673ec33e062cc1e934f6f8d8a6b5d6a013374e2232332f2ead963be2f95f02d179118328e4bf277683ae5677144d5ef5",
    }
  `)
  expect(rounds.map((names) => names.sort())).toMatchInlineSnapshot(`
    [
      [
        "eth_getBlockByNumber",
        "zks_getBridgeContracts",
        "zks_getBridgehubContract",
      ],
      [
        "L1_NULLIFIER",
        "baseToken",
        "eth_maxPriorityFeePerGas",
        "nativeTokenVault",
      ],
      [
        "assetId",
        "decimals",
        "name",
        "symbol",
      ],
      [
        "zks_estimateGasL1ToL2",
      ],
      [
        "l2TransactionBaseCost",
      ],
      [
        "eth_estimateGas",
      ],
      [
        "eth_fillTransaction",
      ],
      [
        "eth_getTransactionCount",
      ],
      [
        "eth_sendRawTransaction",
      ],
    ]
  `)
})

test('behavior: bridge address error takes precedence over concurrent errors', async () => {
  const url = await createRpcProxy(
    anvilMainnet.rpcUrl.http,
    async ({ method }) => {
      if (method === 'zks_getBridgeContracts') {
        await wait(100)
        return { error: { code: -32000, message: 'bridges unavailable' } }
      }
      if (method === 'zks_getBridgehubContract')
        return { error: { code: -32000, message: 'bridgehub unavailable' } }
      if (method === 'eth_getBlockByNumber')
        return { error: { code: -32000, message: 'block unavailable' } }
      return undefined
    },
  )

  const error = await deposit(
    createClient({ chain: mainnet, transport: http(url, { retryCount: 0 }) }),
    {
      account: privateKeyToAccount(accounts[0].privateKey),
      amount: 1_000_000n,
      client: createClient({
        chain: zksync,
        transport: http(url, { retryCount: 0 }),
      }),
      token: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    },
  ).catch((error) => error)

  expect(error.details).toMatchInlineSnapshot(`"bridges unavailable"`)
})
