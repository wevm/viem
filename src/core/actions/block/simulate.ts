import type { Abi, AbiStateMutability, Narrow } from 'abitype'
import { AbiFunction, AbiParameters, Block, Hex, Log } from 'ox'
import type {
  Address,
  BlockOverrides,
  Errors,
  StateOverrides,
  TransactionRequest,
} from 'ox'
import { z } from 'ox/zod'

import type * as Account from '../../Account.js'
import type * as Chain from '../../Chain.js'
import type * as Client from '../../Client.js'
import * as ContractError from '../../ContractError.js'
import * as RpcError from '../../RpcError.js'
import { isAbortError } from '../../internal/errors.js'
import type { Prettify } from '../../internal/types.js'
import { blockParameter } from '../internal/blockParameter.js'
import type { Call, CallResults, Calls } from '../internal/calls.js'
import * as transactionRequest from '../internal/transactionRequest.js'

type RequestOptions = Parameters<Client.Client['request']>[1]

/**
 * Simulates a sequence of blocks with optional block and state overrides
 * (`eth_simulateV1`).
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
 * const [block] = await Actions.block.simulate(client, {
 *   blocks: [{
 *     calls: [{
 *       account: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
 *       to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *       value: 1n,
 *     }],
 *   }],
 * })
 * ```
 */
export async function simulate<
  chain extends Chain.Chain | undefined,
  const calls extends readonly unknown[],
>(
  client: Client.Client<chain>,
  options: simulate.Options<calls>,
): Promise<simulate.ReturnType<chain, calls>> {
  const {
    blockNumber,
    blockTag = client.blockTag ?? 'latest',
    blocks,
    requestOptions,
    returnFullTransactions,
    traceTransfers,
    validation,
  } = options

  try {
    // Chains with a request codec encode calls themselves; nested generic
    // encoding would reject or strip chain-specific fields.
    const codec = client.chain?.schema?.transactionRequest?.toRpc

    const rpcCalls: TransactionRequest.Rpc[][] = []
    const blockStateCalls = blocks.map((block, i) => {
      const calls = block.calls.map((call_) => {
        const call = call_ as Call<unknown, simulate.CallExtraProperties>
        const { abi, account, args, dataSuffix, functionName, ...rest } = call

        const from = (() => {
          if (call.from) return call.from
          const account_ = account ?? client.account
          if (!account_) return undefined
          return typeof account_ === 'string' ? account_ : account_.address
        })()

        const data = (() => {
          const data = abi
            ? AbiFunction.encodeData(
                AbiFunction.fromAbi(abi, functionName, {
                  args: args,
                }),
                args,
              )
            : call.data
          if (!dataSuffix) return data
          return Hex.concat(data ?? '0x', dataSuffix)
        })()

        const request = {
          ...rest,
          data,
          from,
          to: call.to ?? undefined,
        } satisfies TransactionRequest.toRpc.Input

        transactionRequest.assert(request)

        if (!codec) return request

        // The chain codec is an untyped `z.ZodMiniType`, so its encoded output
        // widens to `unknown`; assert back to the RPC shape it produces.
        type BatchedRpc = TransactionRequest.Rpc & {
          calls?:
            | {
                data?: Hex.Hex | undefined
                to?: Address.Address | undefined
                value?: Hex.Hex | undefined
              }[]
            | undefined
        }
        const rpc = z.encode(codec, request) as BatchedRpc

        // `eth_simulateV1` defaults a missing `to` to a contract creation
        // (execution-apis fill rules). Chains that encode requests as batched
        // `calls` omit the top-level `to`, so the node would append a phantom
        // CREATE to the batch. Hoist the last batched call to the top level —
        // the node folds `to` back into the batch, reconstructing the
        // identical call list.
        if (!rpc.to && rpc.calls && rpc.calls.length > 0) {
          const hoisted = rpc.calls[rpc.calls.length - 1]!
          if (hoisted.to) {
            rpc.to = hoisted.to
            rpc.data = hoisted.data
            rpc.value = hoisted.value
            if (rpc.calls.length === 1) delete rpc.calls
            else rpc.calls = rpc.calls.slice(0, -1)
          }
        }

        const calls = rpcCalls[i] ?? []
        calls.push(rpc)
        rpcCalls[i] = calls
        return {}
      })

      return {
        blockOverrides: block.blockOverrides,
        calls,
        stateOverrides: block.stateOverride,
      }
    })

    const block = blockParameter({ blockNumber, blockTag })

    const item = z.RpcSchema.parseItem(z.RpcSchema.Eth, 'eth_simulateV1')
    const params = z.RpcSchema.encodeParams(item, [
      { blockStateCalls, returnFullTransactions, traceTransfers, validation },
      block,
    ])
    if (codec) {
      const input = params[0]
      for (const [i, calls] of rpcCalls.entries())
        input.blockStateCalls[i]!.calls = calls
    }

    type RpcCallResult = {
      error?:
        | { code: number; data?: Hex.Hex | undefined; message: string }
        | undefined
      gasUsed: Hex.Hex
      logs?: readonly Log.Rpc[] | undefined
      returnData: Hex.Hex
      status: Hex.Hex
    }
    const result = (await client.request(
      { method: 'eth_simulateV1', params },
      requestOptions,
    )) as unknown as readonly (Block.Rpc & {
      calls?: readonly RpcCallResult[] | undefined
    })[]

    const schema = client.chain?.schema?.block?.fromRpc

    return result.map((rpcBlock, i) => {
      const { calls: rpcCalls = [], ...blockRpc } = rpcBlock
      const block = (
        schema ? z.decode(schema, blockRpc) : Block.fromRpc(blockRpc)
      ) as Block.Block

      const calls = rpcCalls.map((call, j) => {
        const { abi, args, functionName, to } = blocks[i]!.calls[j]! as Call<
          unknown,
          simulate.CallExtraProperties
        >

        const data = call.error?.data ?? call.returnData
        const gasUsed = Hex.toBigInt(call.gasUsed)
        const logs = call.logs?.map((log) => Log.fromRpc(log))
        const status = call.status === '0x1' ? 'success' : 'failure'

        const result =
          abi && status === 'success' && data !== '0x'
            ? AbiFunction.decodeResult(
                AbiFunction.fromAbi(abi, functionName, {
                  args: args,
                }),
                data,
              )
            : null

        const error = (() => {
          if (status === 'success') return undefined

          const cause =
            data === '0x'
              ? new AbiParameters.ZeroDataError()
              : new ContractError.RawContractError({ data })

          return ContractError.fromError(cause, {
            abi: (abi ?? []) as Abi,
            address: to ?? '0x',
            args,
            functionName: functionName ?? '<unknown>',
          })
        })()

        return {
          data,
          gasUsed,
          logs,
          status,
          ...(status === 'success' ? { result } : { error }),
        }
      })

      return { ...block, calls }
    }) as unknown as simulate.ReturnType<chain, calls>
  } catch (err) {
    if (isAbortError(err)) throw err
    if (err instanceof RpcError.ExecutionError) throw err

    throw new RpcError.ExecutionError(err as Error, { chain: client.chain })
  }
}

export declare namespace simulate {
  type CallExtraProperties = Prettify<
    Omit<
      TransactionRequest.toRpc.Input,
      'blobs' | 'data' | 'input' | 'to' | 'value'
    > & {
      /** Account (or address) attached to the call (`msg.sender`). */
      account?: Account.Account | Address.Address | undefined
      /** Recipient. `null` for a contract deployment. */
      to?: Address.Address | null | undefined
    }
  >

  type Options<calls extends readonly unknown[] = readonly unknown[]> = {
    /** Blocks to simulate (executed in sequence). */
    blocks: readonly {
      /** Block overrides. */
      blockOverrides?: BlockOverrides.BlockOverrides | undefined
      /** Calls to execute. */
      calls: Calls<Narrow<calls>, CallExtraProperties>
      /** State overrides. */
      stateOverride?: StateOverrides.StateOverrides | undefined
    }[]
    /** Per-request transport options. */
    requestOptions?: RequestOptions
    /** Whether to return full transaction objects. */
    returnFullTransactions?: boolean | undefined
    /** Whether to trace ETH transfers as synthetic logs. */
    traceTransfers?: boolean | undefined
    /** Whether to run validation mode (full transaction validation). */
    validation?: boolean | undefined
  } & (
    | {
        /** The block number to simulate from. */
        blockNumber?: bigint | undefined
        blockTag?: undefined
      }
    | {
        blockNumber?: undefined
        /** The block tag to simulate from. @default 'latest' */
        blockTag?: Block.Tag | undefined
      }
  )

  type ReturnType<
    chain extends Chain.Chain | undefined = Chain.Chain | undefined,
    calls extends readonly unknown[] = readonly unknown[],
  > = readonly Prettify<
    Chain.ExtractBlock<chain> & {
      /** Results of the calls executed in this block. */
      calls: CallResults<
        Narrow<calls>,
        true,
        {
          error: Error
          extraProperties: {
            data: Hex.Hex
            gasUsed: bigint
            logs?: readonly Log.Log[] | undefined
          }
          mutability: AbiStateMutability
        }
      >
    }
  >[]

  type ErrorType = RpcError.ExecutionError | Errors.GlobalErrorType
}
