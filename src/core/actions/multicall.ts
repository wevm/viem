import type { AbiStateMutability, Narrow } from 'abitype'
import { Abi, AbiFunction, AbiParameters, Hex, StateOverrides } from 'ox'
import type { Address, Block, Errors, Log } from 'ox'

import type * as Account from '../Account.js'
import type * as Chain from '../Chain.js'
import type * as Client from '../Client.js'
import * as ContractError from '../ContractError.js'
import { BaseError } from '../Errors.js'
import type * as RpcError from '../RpcError.js'
import { isAbortError } from '../internal/errors.js'
import type { Prettify } from '../internal/types.js'
import type { Call, CallResults, Calls } from './internal/calls.js'
import { getBalanceBytecode, multicall3Bytecode } from './internal/constants.js'
import { toDeploylessCallViaBytecodeData } from './internal/deployless.js'
import {
  aggregate3Abi,
  getMulticallAddress,
  isMethodNotSupportedError,
} from './internal/multicall.js'
import { simulate } from './block/simulate.js'
import { createAccessList } from './transaction/createAccessList.js'

type RequestOptions = Parameters<Client.Client['request']>[1]

const zeroAddress = '0x0000000000000000000000000000000000000000'
const ethAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

const balanceOfAbi = /*#__PURE__*/ Abi.from([
  'function balanceOf(address) returns (uint256)',
])
const decimalsAbi = /*#__PURE__*/ Abi.from([
  'function decimals() returns (uint256)',
])
const symbolAbi = /*#__PURE__*/ Abi.from(['function symbol() returns (string)'])
const tokenUriAbi = /*#__PURE__*/ Abi.from([
  'function tokenURI(uint256) returns (string)',
])
const getBalanceFn = /*#__PURE__*/ AbiFunction.from(
  'function getBalance(address)',
)

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

  // Deployless call extracting the account's native balance via a contract read.
  const getBalanceData = from
    ? toDeploylessCallViaBytecodeData({
        code: getBalanceBytecode,
        data: AbiFunction.encodeData(getBalanceFn, [from]),
      })
    : undefined

  // Discover ERC20/721 contracts the calls touch (accounts with touched
  // storage in each call's access list).
  const assetAddresses = traceAssetChanges
    ? await Promise.all(
        calls.map(async (call_) => {
          const call = call_ as Call
          if (!call.data && !call.abi) return undefined
          const data = call.abi
            ? AbiFunction.encodeData(
                AbiFunction.fromAbi(call.abi, call.functionName, {
                  args: call.args,
                }),
                call.args,
              )
            : call.data
          const { accessList } = await createAccessList(client, {
            account: from,
            data,
            to: call.to,
            value: call.value,
          })
          return accessList.map(({ address, storageKeys }) =>
            storageKeys.length > 0 ? address : null,
          )
        }),
      ).then((x) => x.flat().filter(Boolean) as readonly Address.Address[])
    : []

  const assetStateOverride = { [zeroAddress]: { nonce: 0n } }

  const blocks = await simulate(client, {
    // `blockNumber`/`blockTag` are mutually exclusive on the simulate options.
    ...(blockNumber != null ? { blockNumber } : { blockTag }),
    requestOptions,
    blocks: [
      ...(traceAssetChanges
        ? [
            // Native pre-balance.
            {
              calls: [{ data: getBalanceData }],
              stateOverride,
            },
            // Asset pre-balances.
            {
              calls: assetAddresses.map((address, i) => ({
                abi: balanceOfAbi,
                args: [from],
                from: zeroAddress,
                functionName: 'balanceOf',
                nonce: i,
                to: address,
              })),
              stateOverride: assetStateOverride,
            },
          ]
        : []),

      {
        calls: [...calls, { to: zeroAddress }].map((call) => ({
          ...(call as Call),
          from,
        })),
        stateOverride,
      },

      ...(traceAssetChanges
        ? [
            // Native post-balance.
            {
              calls: [{ data: getBalanceData }],
            },
            // Asset post-balances.
            {
              calls: assetAddresses.map((address, i) => ({
                abi: balanceOfAbi,
                args: [from],
                from: zeroAddress,
                functionName: 'balanceOf',
                nonce: i,
                to: address,
              })),
              stateOverride: assetStateOverride,
            },
            // Asset decimals.
            {
              calls: assetAddresses.map((address, i) => ({
                abi: decimalsAbi,
                from: zeroAddress,
                functionName: 'decimals',
                nonce: i,
                to: address,
              })),
              stateOverride: assetStateOverride,
            },
            // Asset token URIs (ERC-721 detection).
            {
              calls: assetAddresses.map((address, i) => ({
                abi: tokenUriAbi,
                args: [0n],
                from: zeroAddress,
                functionName: 'tokenURI',
                nonce: i,
                to: address,
              })),
              stateOverride: assetStateOverride,
            },
            // Asset symbols.
            {
              calls: assetAddresses.map((address, i) => ({
                abi: symbolAbi,
                from: zeroAddress,
                functionName: 'symbol',
                nonce: i,
                to: address,
              })),
              stateOverride: assetStateOverride,
            },
          ]
        : []),
      // Raw balance-probe calls (`data`-only) sit outside the typed `Call`
      // union that structured calls satisfy.
    ] as simulate.Options['blocks'],
    traceTransfers,
    validation,
  })

  const blockResults = traceAssetChanges ? blocks[2]! : blocks[0]!
  const [
    blockEthPre,
    blockAssetsPre,
    ,
    blockEthPost,
    blockAssetsPost,
    blockDecimals,
    blockTokenUri,
    blockSymbols,
  ] = traceAssetChanges ? blocks : []

  // Extract the user calls' results (dropping the trailing sentinel call).
  const { calls: blockCalls, ...block } = blockResults
  const results = (blockCalls as readonly unknown[]).slice(0, -1)

  type BalanceCall = { data: Hex.Hex; status: 'success' | 'failure' }
  type ResultCall = {
    result: unknown
    status: 'success' | 'failure'
  }

  // Pre-execution native + asset balances.
  const ethPre = (blockEthPre?.calls ?? []) as readonly BalanceCall[]
  const assetsPre = (blockAssetsPre?.calls ?? []) as readonly BalanceCall[]
  const balancesPre = [...ethPre, ...assetsPre].map((call) =>
    call.status === 'success' ? Hex.toBigInt(call.data) : null,
  )

  // Post-execution native + asset balances.
  const ethPost = (blockEthPost?.calls ?? []) as readonly BalanceCall[]
  const assetsPost = (blockAssetsPost?.calls ?? []) as readonly BalanceCall[]
  const balancesPost = [...ethPost, ...assetsPost].map((call) =>
    call.status === 'success' ? Hex.toBigInt(call.data) : null,
  )

  // Asset metadata.
  const decimals = ((blockDecimals?.calls ?? []) as readonly ResultCall[]).map(
    (x) => (x.status === 'success' ? (x.result as bigint) : null),
  )
  const symbols = ((blockSymbols?.calls ?? []) as readonly ResultCall[]).map(
    (x) => (x.status === 'success' ? (x.result as string) : null),
  )
  const tokenUri = ((blockTokenUri?.calls ?? []) as readonly ResultCall[]).map(
    (x) => (x.status === 'success' ? (x.result as string) : null),
  )

  const assetChanges: multicall.AssetChange[] = []
  for (const [i, balancePost] of balancesPost.entries()) {
    const balancePre = balancesPre[i]

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

    if (assetChanges.some((change) => change.token.address === token.address))
      continue

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
    block: block,
    results: applyAllowFailure(results, allowFailure),
  }
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

  type Aggregate3Call = {
    allowFailure: boolean
    callData: Hex.Hex
    target: Address.Address
  }
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

  const chunkResults = await Promise.allSettled(
    chunks.map(async (chunk) => {
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
      }) as readonly { returnData: Hex.Hex; success: boolean }[]
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
      for (let j = 0; j < chunks[i]!.length; j++) {
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
      const { callData } = chunks[i]![j]!
      const { call, error: encodeError } = encoded[resultIndex]!
      const { abi, args, functionName, to } = call
      resultIndex++

      try {
        if (encodeError) throw encodeError
        if (callData === '0x') throw new AbiParameters.ZeroDataError()
        if (!success)
          throw new ContractError.RawContractError({ data: returnData })
        const result = abi
          ? AbiFunction.decodeResult(
              AbiFunction.fromAbi(abi, functionName, {
                args: args,
              }),
              returnData,
            )
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
