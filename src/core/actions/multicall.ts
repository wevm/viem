import type { AbiStateMutability, Narrow } from 'abitype'
import {
  Abi,
  AbiEvent,
  AbiFunction,
  AbiParameters,
  Hex,
  StateOverrides,
} from 'ox'
import type { Address, Block, Errors, Log } from 'ox'

import type * as Account from '../Account.js'
import type * as Chain from '../Chain.js'
import type * as Client from '../Client.js'
import * as ContractError from '../ContractError.js'
import { BaseError } from '../Errors.js'
import * as RpcError from '../RpcError.js'
import { isAbortError } from '../internal/errors.js'
import { createBatchScheduler } from '../internal/promise.js'
import type { Prettify } from '../internal/types.js'
import type { Call, CallResults, Calls } from './internal/calls.js'
import { resolveReturnShape } from './internal/contract.js'
import { getBalanceBytecode, multicall3Bytecode } from './internal/constants.js'
import { toDeploylessCallViaBytecodeData } from './internal/deployless.js'
import {
  aggregate3Abi,
  getMulticallAddress,
  getRequestOptionsId,
  isMethodNotSupportedError,
} from './internal/multicall.js'
import { get } from './block/get.js'
import { getNumber } from './block/getNumber.js'
import { simulate } from './block/simulate.js'
import { call } from './call.js'

type RequestOptions = Parameters<Client.Client['request']>[1]

const zeroAddress = '0x0000000000000000000000000000000000000000'
const ethAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

const balanceOfAbi = /*#__PURE__*/ AbiFunction.from(
  'function balanceOf(address) returns (uint256)',
)
const decimalsAbi = /*#__PURE__*/ AbiFunction.from(
  'function decimals() returns (uint256)',
)
const symbolAbi = /*#__PURE__*/ AbiFunction.from(
  'function symbol() returns (string)',
)
const tokenUriAbi = /*#__PURE__*/ AbiFunction.from(
  'function tokenURI(uint256) returns (string)',
)
const getBalanceFn = /*#__PURE__*/ AbiFunction.from(
  'function getBalance(address)',
)

const staticCallCode =
  '0x608060405234801561000f575f5ffd5b5060043610610029575f3560e01c8063fd00430c1461002d575b5f5ffd5b6100476004803603810190610042919061012b565b610049565b005b80825f375f5f825f865afa610060573d5f5f3e3d5ffd5b3d5f5f3e3d5ff35b5f5ffd5b5f5ffd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f61009982610070565b9050919050565b6100a98161008f565b81146100b3575f5ffd5b50565b5f813590506100c4816100a0565b92915050565b5f5ffd5b5f5ffd5b5f5ffd5b5f5f83601f8401126100eb576100ea6100ca565b5b8235905067ffffffffffffffff811115610108576101076100ce565b5b602083019150836001820283011115610124576101236100d2565b5b9250929050565b5f5f5f6040848603121561014257610141610068565b5b5f61014f868287016100b6565b935050602084013567ffffffffffffffff8111156101705761016f61006c565b5b61017c868287016100d6565b9250925050925092509256fea2646970667358221220635ed99185cacf3f2acba6921f23687c969cec2bbaf5f9ad599f507e6e105e6964736f6c63430008230033'
const staticCallAddressBase = 0x00000000000000000000000000000000deadbeefn
const transferEventSelector = /*#__PURE__*/ AbiEvent.getSelector(
  AbiEvent.from(
    'event Transfer(address indexed from, address indexed to, uint256 value)',
  ),
)
const staticCallFn = /*#__PURE__*/ AbiFunction.from(
  'function query(address target, bytes data)',
)

type Aggregate3Call = {
  allowFailure: boolean
  callData: Hex.Hex
  target: Address.Address
}

type Aggregate3Result = {
  returnData: Hex.Hex
  success: boolean
}

/** Per-client `eth_simulateV1` support, learned from method-not-found rejections. */
const simulateV1Support = /*#__PURE__*/ new Map<string, boolean>()

/**
 * Simulates execution of a batch of calls, returning typed per-call results.
 *
 * Executes via `eth_simulateV1` by default; when the node does not support it
 * (and no simulate-only option is requested), execution falls back to a
 * multicall3 `aggregate3` batch. Pin an execution mode with the `mode` option.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const { results } = await Actions.multicall(client, {
 *   account: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
 *   calls: [
 *     {
 *       to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *       value: 1n,
 *     },
 *   ],
 * })
 * ```
 */
export async function multicall<
  chain extends Chain.Chain | undefined,
  const calls extends readonly unknown[],
  mode extends 'auto' | 'simulate' | 'multicall' = 'auto',
  allowFailure extends boolean = true,
  traceAssetChanges extends boolean = false,
  traceTransfers extends boolean = false,
  validation extends boolean = false,
>(
  client: Client.Client<chain>,
  options: multicall.Options<
    calls,
    mode,
    allowFailure,
    traceAssetChanges,
    traceTransfers,
    validation
  >,
): Promise<
  multicall.ReturnType<
    chain,
    calls,
    mode,
    allowFailure,
    [traceAssetChanges | traceTransfers | validation] extends [false]
      ? false
      : true
  >
> {
  const { mode = 'auto' } = options as multicall.Options
  const { traceAssetChanges, traceTransfers, validation } =
    options as multicall.Options<
      readonly unknown[],
      'auto' | 'simulate' | 'multicall',
      boolean,
      boolean,
      boolean,
      boolean
    >

  // Options (and per-call `value`) that `aggregate3` cannot express force the
  // `eth_simulateV1` mode instead of degrading.
  const forced =
    Boolean(traceAssetChanges || traceTransfers || validation) ||
    (options.calls as readonly { value?: bigint | undefined }[]).some(
      (call) => typeof call.value === 'bigint' && call.value !== 0n,
    )

  type Result = multicall.ReturnType<
    chain,
    calls,
    mode,
    allowFailure,
    [traceAssetChanges | traceTransfers | validation] extends [false]
      ? false
      : true
  >

  if (mode === 'multicall') {
    if (forced)
      throw new BaseError(
        "`traceAssetChanges`, `traceTransfers`, `validation`, and call `value` are not supported with `mode: 'multicall'`.",
      )
    return (await executeMulticall(client, options)) as Result
  }

  if (mode === 'auto' && !forced) {
    if (simulateV1Support.get(client.uid) === false)
      return (await executeMulticall(client, options)) as Result

    try {
      return (await executeSimulate(client, options)) as Result
    } catch (err) {
      if (isAbortError(err)) throw err
      if (!isMethodNotSupportedError(err)) throw err
      simulateV1Support.set(client.uid, false)
      return (await executeMulticall(client, options)) as Result
    }
  }

  return (await executeSimulate(client, options)) as Result
}

/** Executes the batch via `eth_simulateV1` (with asset tracing support). */
async function executeSimulate(
  client: Client.Client,
  options: multicall.Options,
): Promise<{
  assetChanges: readonly multicall.AssetChange[]
  block: Block.Block
  results: readonly unknown[]
}> {
  const {
    account: account_ = client.account,
    allowFailure = true,
    blockNumber,
    blockTag,
    calls,
    requestOptions,
    stateOverride,
    traceAssetChanges,
    traceTransfers,
    validation,
  } = options

  const from = account_
    ? typeof account_ === 'string'
      ? account_
      : account_.address
    : undefined

  if (traceAssetChanges && !from)
    throw new BaseError(
      '`account` is required when `traceAssetChanges` is true.',
    )

  const getBalanceData = from
    ? toDeploylessCallViaBytecodeData({
        code: getBalanceBytecode,
        data: AbiFunction.encodeData(getBalanceFn, [from]),
      })
    : undefined

  const blockTag_ = blockTag ?? client.blockTag ?? 'latest'
  let baseBlockNumber = blockNumber
  if (
    traceAssetChanges &&
    typeof baseBlockNumber !== 'bigint' &&
    blockTag_ !== 'earliest' &&
    blockTag_ !== 'pending'
  ) {
    if (blockTag_ === 'latest')
      baseBlockNumber = await getNumber(client, { cacheTime: 0 })
    else {
      const block = await get(client, { blockTag: blockTag_ })
      if (typeof block.number !== 'bigint')
        throw new BaseError(
          `Block tag \`${blockTag_}\` did not resolve to a number.`,
        )
      baseBlockNumber = block.number
    }
  }
  const blockOptions =
    typeof baseBlockNumber === 'bigint'
      ? { blockNumber: baseBlockNumber }
      : { blockTag: blockTag_ }

  const discovery = traceAssetChanges
    ? await simulate(client, {
        ...blockOptions,
        blocks: [
          {
            calls: calls.map((call) => ({
              ...(call as Call),
              from,
            })),
            stateOverride,
          },
        ],
        requestOptions,
        traceTransfers,
        validation,
      } as simulate.Options)
    : undefined

  const assetAddresses = discovery
    ? [
        ...new Set([
          ...tokensFromLogs(
            discovery[0]!.calls.flatMap((call) => call.logs ?? []),
            from!,
          ),
          ...calls.map((call_) => {
            const call = call_ as Call
            return call.to?.toLowerCase()
          }),
        ]),
      ].filter(
        (address): address is Address.Address =>
          Boolean(address) && address !== ethAddress && address !== zeroAddress,
      )
    : []

  const staticCallAddress = getStaticCallAddress([
    ...(from ? [from] : []),
    ...assetAddresses,
    ...Object.keys(stateOverride ?? {}),
  ])
  const staticCallStateOverride = {
    [staticCallAddress]: { code: staticCallCode },
  } as StateOverrides.StateOverrides

  const [balanceCallsPre, blocks] = await Promise.all([
    traceAssetChanges
      ? Promise.all([
          readBalance(client, {
            account: from!,
            ...blockOptions,
            data: getBalanceData!,
            requestOptions,
            stateOverride,
          }),
          ...assetAddresses.map((address) =>
            readBalance(client, {
              account: from!,
              address,
              ...blockOptions,
              data: AbiFunction.encodeData(balanceOfAbi, [from!]),
              requestOptions,
              stateOverride,
              staticCallAddress,
            }),
          ),
        ])
      : [],
    simulate(client, {
      ...blockOptions,
      blocks: [
        {
          calls: [...calls, { to: zeroAddress }].map((call) => ({
            ...(call as Call),
            from,
          })),
          stateOverride,
        },
        ...(traceAssetChanges
          ? [
              {
                calls: [{ data: getBalanceData }],
              },
              {
                calls: assetAddresses.map((address) => ({
                  data: encodeStaticCall(
                    address,
                    AbiFunction.encodeData(balanceOfAbi, [from!]),
                  ),
                  from: zeroAddress,
                  to: staticCallAddress,
                })),
                stateOverride: staticCallStateOverride,
              },
              {
                calls: assetAddresses.map((address) => ({
                  data: encodeStaticCall(
                    address,
                    AbiFunction.encodeData(decimalsAbi),
                  ),
                  from: zeroAddress,
                  to: staticCallAddress,
                })),
                stateOverride: staticCallStateOverride,
              },
              {
                calls: assetAddresses.map((address) => ({
                  data: encodeStaticCall(
                    address,
                    AbiFunction.encodeData(tokenUriAbi, [0n]),
                  ),
                  from: zeroAddress,
                  to: staticCallAddress,
                })),
                stateOverride: staticCallStateOverride,
              },
              {
                calls: assetAddresses.map((address) => ({
                  data: encodeStaticCall(
                    address,
                    AbiFunction.encodeData(symbolAbi),
                  ),
                  from: zeroAddress,
                  to: staticCallAddress,
                })),
                stateOverride: staticCallStateOverride,
              },
            ]
          : []),
      ] as simulate.Options['blocks'],
      requestOptions,
      traceTransfers,
      validation,
    } as simulate.Options),
  ])

  const blockResults = blocks[0]!
  const [
    blockEthPost,
    blockAssetsPost,
    blockDecimals,
    blockTokenUri,
    blockSymbols,
  ] = traceAssetChanges ? blocks.slice(1) : []

  const { calls: blockCalls, ...block } = blockResults
  const results = (blockCalls as readonly unknown[]).slice(0, -1)

  type BalanceCall = { data: Hex.Hex; status: 'success' | 'failure' }

  const balancesPre = balanceCallsPre.map((call) =>
    isBalance(call) ? Hex.toBigInt(call.data) : null,
  )

  const ethPost = (blockEthPost?.calls ?? []) as readonly BalanceCall[]
  const assetsPost = (blockAssetsPost?.calls ?? []) as readonly BalanceCall[]
  const balanceCallsPost = [...ethPost, ...assetsPost]
  const balancesPost = balanceCallsPost.map((call) =>
    isBalance(call) ? Hex.toBigInt(call.data) : null,
  )

  const decimals = (blockDecimals?.calls ?? []).map((call) =>
    decodeAssetResult(call as BalanceCall, decimalsAbi),
  ) as (bigint | null)[]
  const symbols = (blockSymbols?.calls ?? []).map((call) =>
    decodeAssetResult(call as BalanceCall, symbolAbi),
  ) as (string | null)[]
  const tokenUri = (blockTokenUri?.calls ?? []).map((call) =>
    decodeAssetResult(call as BalanceCall, tokenUriAbi),
  ) as (string | null)[]

  const assetChanges: multicall.AssetChange[] = []
  for (const [i, balancePost] of balancesPost.entries()) {
    const balancePre_ = balancesPre[i]
    const preCall = balanceCallsPre[i]
    const balancePre =
      typeof balancePre_ === 'bigint'
        ? balancePre_
        : i > 0 && preCall?.status === 'success' && preCall.data === '0x'
          ? 0n
          : null

    if (typeof balancePost !== 'bigint') continue
    if (typeof balancePre !== 'bigint') continue

    const token = (() => {
      if (i === 0)
        return {
          address: ethAddress as Address.Address,
          decimals: 18,
          symbol: 'ETH',
        }

      const decimals_ = decimals[i - 1]
      const symbol_ = symbols[i - 1]
      const tokenUri_ = tokenUri[i - 1]

      return {
        address: assetAddresses[i - 1]!,
        decimals: tokenUri_ || decimals_ ? Number(decimals_ ?? 1) : undefined,
        symbol: symbol_ ?? undefined,
      }
    })()

    assetChanges.push({
      token,
      value: {
        diff: balancePost - balancePre,
        post: balancePost,
        pre: balancePre,
      },
    })
  }

  return {
    assetChanges,
    block,
    results: applyAllowFailure(results, allowFailure),
  }
}

function encodeStaticCall(address: Address.Address, data: Hex.Hex) {
  return AbiFunction.encodeData(staticCallFn, [address, data])
}

function tokensFromLogs(
  logs: readonly Log.Log[],
  account: Address.Address,
): Address.Address[] {
  const account_ = Hex.padLeft(account.toLowerCase() as Hex.Hex, 32)
  return logs
    .filter((log) => {
      if (log.topics[0]?.toLowerCase() !== transferEventSelector) return false
      if (log.address.toLowerCase() === ethAddress) return false
      return (
        log.topics[1]?.toLowerCase() === account_ ||
        log.topics[2]?.toLowerCase() === account_
      )
    })
    .map((log) => log.address.toLowerCase() as Address.Address)
}

function isBalance(call: { data: Hex.Hex; status: 'success' | 'failure' }) {
  return call.status === 'success' && /^0x[\da-f]{64}$/i.test(call.data)
}

function decodeAssetResult(
  call: { data: Hex.Hex; status: 'success' | 'failure' },
  abi: AbiFunction.AbiFunction,
) {
  if (call.status === 'failure' || call.data === '0x') return null
  try {
    return AbiFunction.decodeResult(abi, call.data)
  } catch {
    return null
  }
}

async function readBalance(
  client: Client.Client,
  options: {
    account: Address.Address
    address?: Address.Address | undefined
    blockNumber?: bigint | undefined
    blockTag?: Block.Tag | undefined
    data: Hex.Hex
    requestOptions?: RequestOptions | undefined
    staticCallAddress?: Address.Address | undefined
    stateOverride?: StateOverrides.StateOverrides | undefined
  },
) {
  const {
    account,
    address,
    blockNumber,
    blockTag,
    data,
    requestOptions,
    staticCallAddress,
    stateOverride,
  } = options
  try {
    const result = await call({ ...client, ccipRead: undefined }, {
      account: address ? zeroAddress : account,
      data: address ? encodeStaticCall(address, data) : data,
      requestOptions,
      stateOverride:
        address && staticCallAddress
          ? {
              ...stateOverride,
              [staticCallAddress]: { code: staticCallCode },
            }
          : stateOverride,
      ...(address ? { to: staticCallAddress } : {}),
      ...(typeof blockNumber === 'bigint' ? { blockNumber } : { blockTag }),
    } as never)
    return { data: result.data ?? '0x', status: 'success' as const }
  } catch (error) {
    if (
      !(error instanceof RpcError.ExecutionError) ||
      !(error.cause instanceof RpcError.ExecutionRevertedError)
    )
      throw error
    return { data: '0x' as const, status: 'failure' as const }
  }
}

function getStaticCallAddress(addresses: readonly string[]): Address.Address {
  const occupied = new Set(addresses.map((address) => address.toLowerCase()))
  let value = staticCallAddressBase
  while (occupied.has(`0x${value.toString(16).padStart(40, '0')}`)) value++
  return `0x${value.toString(16).padStart(40, '0')}`
}

/** Executes the batch as a multicall3 `aggregate3` read (`eth_call`). */
async function executeMulticall(
  client: Client.Client,
  options: multicall.Options,
): Promise<{ results: readonly unknown[] }> {
  const {
    account: account_ = client.account,
    allowFailure = true,
    blockNumber,
    blockTag = client.blockTag ?? 'latest',
    calls,
    multicallAddress: multicallAddress_,
    requestOptions,
    stateOverride,
  } = options

  const from = account_
    ? typeof account_ === 'string'
      ? account_
      : account_.address
    : undefined

  const config =
    typeof client.batch?.multicall === 'object' ? client.batch.multicall : {}
  const batchSize = options.batchSize ?? config.batchSize ?? 1024
  const deployless = options.deployless ?? config.deployless ?? false

  const multicallAddress =
    multicallAddress_ ??
    getMulticallAddress(client, { blockNumber, deployless })

  type EncodedCall = {
    call: Call
    error?: Error | undefined
  }

  // Encode each call, chunking by cumulative calldata size.
  const chunks: Aggregate3Call[][] = [[]]
  const encoded: EncodedCall[] = []
  let chunkIndex = 0
  let chunkSize = 0
  for (const call_ of calls) {
    const call = call_ as Call

    const { callData, error } = (() => {
      try {
        const data = call.abi
          ? AbiFunction.encodeData(
              AbiFunction.fromAbi(call.abi, call.functionName, {
                args: call.args,
              }),
              call.args,
            )
          : (call.data ?? '0x')
        const callData = call.dataSuffix
          ? Hex.concat(data, call.dataSuffix)
          : data
        return { callData, error: undefined }
      } catch (err) {
        const error = ContractError.fromError(err as Error, {
          abi: (call.abi ?? []) as Abi.Abi,
          address: call.to ?? '0x',
          args: call.args,
          functionName: (call.functionName as string) ?? '<unknown>',
          sender: from,
        })
        if (!allowFailure) throw error
        return { callData: '0x' as Hex.Hex, error }
      }
    })()

    encoded.push({ call, error })

    chunkSize += (callData.length - 2) / 2
    if (
      batchSize > 0 &&
      chunkSize > batchSize &&
      chunks[chunkIndex]!.length > 0
    ) {
      chunkIndex++
      chunkSize = (callData.length - 2) / 2
      chunks[chunkIndex] = []
    }

    chunks[chunkIndex]!.push({
      allowFailure: true,
      callData,
      target: call.to as Address.Address,
    })
  }

  const rpcStateOverride = stateOverride
    ? StateOverrides.toRpc(stateOverride)
    : undefined
  const block =
    typeof blockNumber === 'bigint' ? Hex.fromNumber(blockNumber) : blockTag

  const batching = Boolean(client.batch?.multicall)
  const batches = batching
    ? chunks.flatMap((chunk) => chunk.map((call) => [call]))
    : chunks
  const chunkResults = await Promise.allSettled(
    batches.map(async (chunk) => {
      if (batching)
        return [
          await scheduleMulticall(client, {
            batchSize,
            block,
            call: chunk[0]!,
            from,
            multicallAddress,
            requestOptions,
            stateOverride,
          }),
        ]

      const calldata = AbiFunction.encodeData(aggregate3Abi, [chunk])

      const request =
        multicallAddress === null
          ? {
              data: toDeploylessCallViaBytecodeData({
                code: multicall3Bytecode,
                data: calldata,
              }),
              from,
            }
          : { data: calldata, from, to: multicallAddress }

      const response = await client.request(
        {
          method: 'eth_call',
          params: rpcStateOverride
            ? [request, block, rpcStateOverride]
            : [request, block],
        },
        requestOptions,
      )

      return AbiFunction.decodeResult(aggregate3Abi, response as Hex.Hex, {
        as: 'Object',
      }) as readonly Aggregate3Result[]
    }),
  )

  type Result = {
    error?: Error | undefined
    result?: unknown
    status: 'success' | 'failure'
  }
  const results: Result[] = []
  let resultIndex = 0
  for (const [i, chunkResult] of chunkResults.entries()) {
    // A failed chunk request (e.g. network error) fails each of its calls.
    if (chunkResult.status === 'rejected') {
      if (!allowFailure) throw chunkResult.reason
      for (let j = 0; j < batches[i]!.length; j++) {
        results.push({
          error: chunkResult.reason as Error,
          result: undefined,
          status: 'failure',
        })
        resultIndex++
      }
      continue
    }

    for (const [j, { returnData, success }] of chunkResult.value.entries()) {
      const { callData } = batches[i]![j]!
      const { call, error: encodeError } = encoded[resultIndex]!
      const { abi, args, functionName, to } = call
      resultIndex++

      try {
        if (encodeError) throw encodeError
        if (callData === '0x') throw new AbiParameters.ZeroDataError()
        if (!success)
          throw new ContractError.RawContractError({ data: returnData })
        const abiItem = abi
          ? AbiFunction.fromAbi(abi, functionName, { args: args })
          : undefined
        const result = abiItem
          ? AbiFunction.decodeResult(abiItem, returnData, {
              as: resolveReturnShape(abiItem, call.as ?? 'Object'),
            })
          : returnData
        results.push({ error: undefined, result, status: 'success' })
      } catch (err) {
        const error =
          err === encodeError
            ? encodeError
            : ContractError.fromError(err as Error, {
                abi: (abi ?? []) as Abi.Abi,
                address: to ?? '0x',
                args,
                functionName: (functionName as string) ?? '<unknown>',
                sender: from,
              })
        if (!allowFailure) throw error
        results.push({ error, result: undefined, status: 'failure' })
      }
    }
  }

  if (results.length !== calls.length)
    throw new BaseError('multicall results mismatch')

  return { results: applyAllowFailure(results, allowFailure) }
}

async function scheduleMulticall(
  client: Client.Client,
  options: {
    batchSize: number
    block: Hex.Hex | Block.Tag
    call: Aggregate3Call
    from: Address.Address | undefined
    multicallAddress: Address.Address | null
    requestOptions?: RequestOptions
    stateOverride?: StateOverrides.StateOverrides | undefined
  },
): Promise<Aggregate3Result> {
  const {
    batchSize,
    block,
    call,
    from,
    multicallAddress,
    requestOptions,
    stateOverride,
  } = options
  const { wait = 0 } =
    typeof client.batch?.multicall === 'object' ? client.batch.multicall : {}
  const rpcStateOverride = stateOverride
    ? StateOverrides.toRpc(stateOverride)
    : undefined

  const { schedule } = createBatchScheduler<
    Aggregate3Call,
    readonly Aggregate3Result[]
  >({
    id: JSON.stringify([
      'multicall',
      client.uid,
      batchSize,
      block,
      from,
      multicallAddress,
      getRequestOptionsId(requestOptions),
      rpcStateOverride,
    ]),
    wait,
    shouldSplitBatch(calls) {
      if (batchSize <= 0) return false
      const size = calls.reduce(
        (size, { callData }) => size + (callData.length - 2) / 2,
        0,
      )
      return size > batchSize
    },
    async fn(calls) {
      const calldata = AbiFunction.encodeData(aggregate3Abi, [calls])
      const request =
        multicallAddress === null
          ? {
              data: toDeploylessCallViaBytecodeData({
                code: multicall3Bytecode,
                data: calldata,
              }),
              from,
            }
          : { data: calldata, from, to: multicallAddress }

      const response = await client.request(
        {
          method: 'eth_call',
          params: rpcStateOverride
            ? [request, block, rpcStateOverride]
            : [request, block],
        },
        requestOptions,
      )

      return AbiFunction.decodeResult(aggregate3Abi, response as Hex.Hex, {
        as: 'Object',
      }) as readonly Aggregate3Result[]
    },
  })

  const [result] = await schedule(call)
  return result
}

/** Collapses status objects to bare results when `allowFailure` is `false`. */
function applyAllowFailure(
  results: readonly unknown[],
  allowFailure: boolean,
): readonly unknown[] {
  if (allowFailure) return results
  return results.map((result_) => {
    const result = result_ as {
      error?: Error | undefined
      result: unknown
      status: 'success' | 'failure'
    }
    if (result.status === 'failure') throw result.error
    return result.result
  })
}

export declare namespace multicall {
  type AssetChange = {
    /** Token the balance change applies to (native currency uses the `0xeeee…eeee` sentinel address). */
    token: {
      address: Address.Address
      decimals?: number | undefined
      symbol?: string | undefined
    }
    /** Balance change of `account`. */
    value: { diff: bigint; post: bigint; pre: bigint }
  }

  type Options<
    calls extends readonly unknown[] = readonly unknown[],
    mode extends 'auto' | 'simulate' | 'multicall' =
      | 'auto'
      | 'simulate'
      | 'multicall',
    allowFailure extends boolean = boolean,
    traceAssetChanges extends boolean = boolean,
    traceTransfers extends boolean = boolean,
    validation extends boolean = boolean,
  > = {
    /** Account attached to the calls (`msg.sender`). Required for `traceAssetChanges`. */
    account?: Account.Account | Address.Address | undefined
    /** Whether to return per-call `{ status, result | error }` objects (`true`) or bare results, throwing on the first failure (`false`). @default true */
    allowFailure?: allowFailure | boolean | undefined
    /**
     * Execution mode.
     *
     * - `'auto'` (default): attempts `eth_simulateV1`; nodes that do not support it fall back to a multicall3 `aggregate3` batch (cached per client).
     * - `'simulate'`: always `eth_simulateV1`.
     * - `'multicall'`: always `aggregate3` (no detection request).
     */
    mode?: mode | 'auto' | 'simulate' | 'multicall' | undefined
    /** Calls to simulate. */
    calls: Calls<Narrow<calls>>
    /** Per-request transport options. */
    requestOptions?: RequestOptions
    /** State overrides. */
    stateOverride?: StateOverrides.StateOverrides | undefined
  } & (mode extends 'multicall'
    ? {
        traceAssetChanges?: undefined
        traceTransfers?: undefined
        validation?: undefined
      } & MulticallOptions
    : mode extends 'simulate'
      ? {
          batchSize?: undefined
          deployless?: undefined
          multicallAddress?: undefined
        } & SimulateOptions<traceAssetChanges, traceTransfers, validation>
      : SimulateOptions<traceAssetChanges, traceTransfers, validation> &
          MulticallOptions) &
    (
      | {
          /** The block number to simulate against. */
          blockNumber?: bigint | undefined
          blockTag?: undefined
        }
      | {
          blockNumber?: undefined
          /** The block tag to simulate against. @default 'latest' */
          blockTag?: Block.Tag | undefined
        }
    )

  type SimulateOptions<
    traceAssetChanges extends boolean = boolean,
    traceTransfers extends boolean = boolean,
    validation extends boolean = boolean,
  > = {
    /** Whether to trace native/ERC20/ERC721 balance changes of `account`. Forces `eth_simulateV1`. */
    traceAssetChanges?: traceAssetChanges | boolean | undefined
    /** Whether to trace transfers as synthetic logs. Forces `eth_simulateV1`. */
    traceTransfers?: traceTransfers | boolean | undefined
    /** Whether to run validation mode. Forces `eth_simulateV1`. */
    validation?: validation | boolean | undefined
  }

  type MulticallOptions = {
    /** Max calldata bytes per `aggregate3` chunk. @default client.batch.multicall.batchSize ?? 1024 */
    batchSize?: number | undefined
    /** Force a deployless multicall (bytecode `eth_call`). */
    deployless?: boolean | undefined
    /** Multicall3 address override. @default client.chain.contracts.multicall3 */
    multicallAddress?: Address.Address | undefined
  }

  type ResultsExtraProperties = {
    data: Hex.Hex
    gasUsed: bigint
    logs?: readonly Log.Log[] | undefined
  }

  type ReturnType<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    calls extends readonly unknown[] = readonly unknown[],
    mode extends 'auto' | 'simulate' | 'multicall' = 'auto',
    allowFailure extends boolean = true,
    forced extends boolean = false,
  > = mode extends 'multicall'
    ? {
        /** Per-call results (decoded return values only). */
        results: CallResults<
          Narrow<calls>,
          allowFailure,
          { error: Error; extraProperties: {}; mutability: AbiStateMutability }
        >
      }
    : mode extends 'simulate'
      ? RichReturnType<chain, calls, allowFailure>
      : forced extends true
        ? RichReturnType<chain, calls, allowFailure>
        : {
            /** Balance changes of `account` (only populated on the `eth_simulateV1` path with `traceAssetChanges`). */
            assetChanges?: readonly AssetChange[] | undefined
            /** Simulated block (`undefined` when execution fell back to `aggregate3`). */
            block?: Prettify<Chain.ExtractBlock<chain>> | undefined
            /** Per-call results (`data`/`gasUsed`/`logs` extras present only on the `eth_simulateV1` path). */
            results: CallResults<
              Narrow<calls>,
              allowFailure,
              {
                error: Error
                extraProperties: Partial<ResultsExtraProperties>
                mutability: AbiStateMutability
              }
            >
          }

  type RichReturnType<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    calls extends readonly unknown[] = readonly unknown[],
    allowFailure extends boolean = true,
  > = {
    /** Balance changes of `account` (populated when `traceAssetChanges` is `true`). */
    assetChanges: readonly AssetChange[]
    /** Simulated block the calls executed in. */
    block: Prettify<Chain.ExtractBlock<chain>>
    /** Per-call results. */
    results: CallResults<
      Narrow<calls>,
      allowFailure,
      {
        error: Error
        extraProperties: ResultsExtraProperties
        mutability: AbiStateMutability
      }
    >
  }

  type ErrorType =
    | RpcError.ExecutionError
    | ContractError.ContractFunctionExecutionError
    | Errors.GlobalErrorType
}
