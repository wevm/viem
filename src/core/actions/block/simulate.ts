import type { Abi, AbiStateMutability, Narrow } from 'abitype'
import * as AbiFunction from 'ox/AbiFunction'
import * as AbiParameters from 'ox/AbiParameters'
import type * as Address from 'ox/Address'
import * as Block from 'ox/Block'
import type * as BlockOverrides from 'ox/BlockOverrides'
import type * as Errors from 'ox/Errors'
import * as Hex from 'ox/Hex'
import * as Log from 'ox/Log'
import type * as StateOverrides from 'ox/StateOverrides'
import type * as TransactionRequest from 'ox/TransactionRequest'
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
    const blockStateCalls = blocks.map((block) => {
      const calls = block.calls.map((call_) => {
        const call = call_ as Call<unknown, simulate.CallExtraProperties>
        const { abi, account, args, dataSuffix, functionName, ...rest } = call

        const from = (() => {
          if (call.from) return call.from
          if (!account) return undefined
          return typeof account === 'string' ? account : account.address
        })()

        const data = (() => {
          const data = abi
            ? AbiFunction.encodeData(
                AbiFunction.fromAbi(abi, functionName as never, {
                  args: args as never,
                }),
                args as never,
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

        return request
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
    ] as never)

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
      { method: 'eth_simulateV1', params } as never,
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
                AbiFunction.fromAbi(abi, functionName as never, {
                  args: args as never,
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
