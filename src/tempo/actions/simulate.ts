import type { Abi, AbiStateMutability, Address, Narrow } from 'abitype'
import * as BlockOverrides from 'ox/BlockOverrides'
import type * as RpcSchema from 'ox/RpcSchema'
import type { RpcSchemaTempo } from 'ox/tempo'

import {
  type ParseAccountErrorType,
  parseAccount,
} from '../../accounts/utils/parseAccount.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { AbiDecodingZeroDataError } from '../../errors/abi.js'
import type { BaseError } from '../../errors/base.js'
import { RawContractError } from '../../errors/contract.js'
import { UnknownNodeError } from '../../errors/node.js'
import type { ErrorType as ErrorType_ } from '../../errors/utils.js'
import type { Account } from '../../types/account.js'
import type { Block, BlockTag } from '../../types/block.js'
import type { Call, Calls } from '../../types/calls.js'
import type { Chain } from '../../types/chain.js'
import type { Log } from '../../types/log.js'
import type { Hex } from '../../types/misc.js'
import type { MulticallResults } from '../../types/multicall.js'
import type { StateOverride } from '../../types/stateOverride.js'
import type { TransactionRequest } from '../../types/transaction.js'
import type { ExactPartial, UnionOmit } from '../../types/utils.js'
import {
  type DecodeFunctionResultErrorType,
  decodeFunctionResult,
} from '../../utils/abi/decodeFunctionResult.js'
import {
  type EncodeFunctionDataErrorType,
  encodeFunctionData,
} from '../../utils/abi/encodeFunctionData.js'
import { concat } from '../../utils/data/concat.js'
import {
  type NumberToHexErrorType,
  numberToHex,
} from '../../utils/encoding/toHex.js'
import { getContractError } from '../../utils/errors/getContractError.js'
import {
  type GetNodeErrorReturnType,
  getNodeError,
} from '../../utils/errors/getNodeError.js'
import {
  type FormatBlockErrorType,
  formatBlock,
} from '../../utils/formatters/block.js'
import { formatLog } from '../../utils/formatters/log.js'
import {
  type FormatTransactionRequestErrorType,
  formatTransactionRequest,
} from '../../utils/formatters/transactionRequest.js'
import {
  type SerializeStateOverrideErrorType,
  serializeStateOverride,
} from '../../utils/stateOverride.js'
import {
  type AssertRequestErrorType,
  assertRequest,
} from '../../utils/transaction/assertRequest.js'

export type TokenMetadata = {
  [address: Hex]: {
    name: string
    symbol: string
    currency: string
  }
}

type CallExtraProperties = ExactPartial<
  UnionOmit<
    TransactionRequest,
    'blobs' | 'data' | 'kzg' | 'to' | 'sidecars' | 'value'
  >
> & {
  /** Account attached to the call (msg.sender). */
  account?: Account | Address | undefined
  /** Recipient. `null` if contract deployment. */
  to?: Address | null | undefined
}

/**
 * Simulates a set of calls on block(s) via `tempo_simulateV1`.
 *
 * Returns simulated block results and token metadata for any TIP-20
 * tokens involved in the simulation.
 *
 * @example
 * ```ts
 * import { createClient, http, parseUnits } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: '0x...',
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const { blocks, tokenMetadata } = await Actions.simulate.simulateBlocks(client, {
 *   blocks: [{
 *     calls: [
 *       Actions.token.transfer.call({
 *         token: '0x20c0...01',
 *         to: '0x...',
 *         amount: parseUnits('100', 6),
 *       }),
 *     ],
 *   }],
 *   traceTransfers: true,
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - {@link simulateBlocks.Parameters}
 * @returns Simulated blocks and token metadata. {@link simulateBlocks.ReturnType}
 */
export async function simulateBlocks<
  chain extends Chain | undefined,
  const calls extends readonly unknown[],
>(
  client: Client<Transport, chain>,
  parameters: simulateBlocks.Parameters<calls>,
): Promise<simulateBlocks.ReturnType<calls>> {
  const {
    blockNumber,
    blockTag = client.experimental_blockTag ?? 'latest',
    blocks,
    returnFullTransactions,
    traceTransfers,
    validation,
  } = parameters

  try {
    const blockStateCalls = []
    for (const block of blocks) {
      const blockOverrides = block.blockOverrides
        ? BlockOverrides.toRpc(block.blockOverrides)
        : undefined
      const calls = block.calls.map((call_) => {
        const call = call_ as Call<unknown, CallExtraProperties>
        const account = call.account
          ? parseAccount(call.account)
          : client.account
            ? parseAccount(client.account)
            : undefined
        const data = call.abi ? encodeFunctionData(call) : call.data
        const request = {
          ...call,
          account,
          data: call.dataSuffix
            ? concat([data || '0x', call.dataSuffix])
            : data,
          from: call.from ?? account?.address,
        } as const
        assertRequest(request)
        return formatTransactionRequest(request)
      })
      const stateOverrides = block.stateOverrides
        ? serializeStateOverride(block.stateOverrides)
        : undefined

      blockStateCalls.push({
        blockOverrides,
        calls,
        stateOverrides,
      })
    }

    const blockNumberHex =
      typeof blockNumber === 'bigint' ? numberToHex(blockNumber) : undefined
    const block = blockNumberHex || blockTag

    type tempo_simulateV1 = RpcSchema.ToViem<RpcSchemaTempo.Tempo>[0]
    const result = await client.request<tempo_simulateV1>({
      method: 'tempo_simulateV1',
      params: [
        {
          blockStateCalls,
          returnFullTransactions,
          traceTransfers,
          validation,
        } as tempo_simulateV1['Parameters'][0],
        block,
      ],
    })

    return {
      blocks: result.blocks.map((block, i) => ({
        ...formatBlock(block as never),
        calls: block.calls?.map((call, j) => {
          const { abi, args, functionName, to } = blocks[i].calls[j] as Call<
            unknown,
            CallExtraProperties
          >

          const data = call.error?.data ?? call.returnData
          const gasUsed = BigInt(call.gasUsed)
          const logs = call.logs?.map((log) => formatLog(log))
          const status = call.status === '0x1' ? 'success' : 'failure'

          const result =
            abi && status === 'success' && data !== '0x'
              ? decodeFunctionResult({
                  abi,
                  data,
                  functionName,
                })
              : null

          const error = (() => {
            if (status === 'success') return undefined

            let error: Error | undefined
            if (data === '0x') error = new AbiDecodingZeroDataError()
            else if (data) error = new RawContractError({ data })

            if (!error) return undefined
            return getContractError(error, {
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
            ...(status === 'success'
              ? {
                  result,
                }
              : {
                  error,
                }),
          }
        }),
      })),
      tokenMetadata: result.tokenMetadata ?? {},
    } as unknown as simulateBlocks.ReturnType<calls>
  } catch (e) {
    const cause = e as BaseError
    const error = getNodeError(cause, {})
    if (error instanceof UnknownNodeError) throw cause
    throw error
  }
}

export declare namespace simulateBlocks {
  export type Parameters<
    calls extends readonly unknown[] = readonly unknown[],
  > = {
    /** Blocks to simulate. */
    blocks: readonly {
      /** Block overrides. */
      blockOverrides?: BlockOverrides.BlockOverrides | undefined
      /** Calls to execute. */
      calls: Calls<Narrow<calls>, CallExtraProperties>
      /** State overrides. */
      stateOverrides?: StateOverride | undefined
    }[]
    /** Whether to return the full transactions. */
    returnFullTransactions?: boolean | undefined
    /** Whether to trace transfers. */
    traceTransfers?: boolean | undefined
    /** Whether to enable validation mode. */
    validation?: boolean | undefined
  } & (
    | {
        /** The balance of the account at a block number. */
        blockNumber?: bigint | undefined
        blockTag?: undefined
      }
    | {
        blockNumber?: undefined
        /**
         * The balance of the account at a block tag.
         * @default 'latest'
         */
        blockTag?: BlockTag | undefined
      }
  )

  export type ReturnType<
    calls extends readonly unknown[] = readonly unknown[],
  > = {
    blocks: readonly (Block & {
      calls: MulticallResults<
        Narrow<calls>,
        true,
        {
          extraProperties: {
            data: Hex
            gasUsed: bigint
            logs?: Log[] | undefined
          }
          error: Error
          mutability: AbiStateMutability
        }
      >
    })[]
    tokenMetadata: Record<Address, TokenMetadata>
  }

  export type ErrorType =
    | AssertRequestErrorType
    | DecodeFunctionResultErrorType
    | EncodeFunctionDataErrorType
    | FormatBlockErrorType
    | FormatTransactionRequestErrorType
    | GetNodeErrorReturnType
    | ParseAccountErrorType
    | SerializeStateOverrideErrorType
    | NumberToHexErrorType
    | ErrorType_
}

/**
 * Simulates execution of a batch of calls via `tempo_simulateV1`.
 *
 * A convenience wrapper around {@link simulateBlocks} that runs all
 * calls in a single block and returns flattened results.
 *
 * @example
 * ```ts
 * import { createClient, http, parseUnits } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { Actions, Addresses } from 'viem/tempo'
 *
 * const client = createClient({
 *   account: '0x...',
 *   chain: tempo,
 *   transport: http(),
 * })
 *
 * const { results, tokenMetadata } = await Actions.simulate.simulateCalls(client, {
 *   calls: [
 *     Actions.token.approve.call({
 *       token: '0x20c0...01',
 *       spender: Addresses.stablecoinDex,
 *       amount: parseUnits('100', 6),
 *     }),
 *     Actions.dex.buy.call({
 *       tokenIn: '0x20c0...01',
 *       tokenOut: '0x20c0...02',
 *       amountOut: parseUnits('10', 6),
 *       maxAmountIn: parseUnits('100', 6),
 *     }),
 *     Actions.token.transfer.call({
 *       token: '0x20c0...02',
 *       to: '0x...',
 *       amount: parseUnits('10', 6),
 *     }),
 *   ],
 * })
 * ```
 *
 * @param client - Client.
 * @param parameters - {@link simulateCalls.Parameters}
 * @returns Results, block, and token metadata. {@link simulateCalls.ReturnType}
 */
export async function simulateCalls<
  const calls extends readonly unknown[],
  chain extends Chain | undefined,
  account extends Account | Address | undefined = undefined,
>(
  client: Client<Transport, chain>,
  parameters: simulateCalls.Parameters<calls, account>,
): Promise<simulateCalls.ReturnType<calls>> {
  const {
    blockNumber,
    blockTag,
    calls,
    stateOverrides,
    traceTransfers,
    validation,
  } = parameters

  const account = parameters.account
    ? parseAccount(parameters.account)
    : undefined

  const result = await simulateBlocks(client, {
    blockNumber,
    blockTag: blockTag as undefined,
    blocks: [
      {
        calls: calls.map((call) => ({
          ...(call as Call),
          from: account?.address,
        })) as any,
        stateOverrides,
      },
    ],
    traceTransfers,
    validation,
  })

  const { calls: block_calls, ...block } = result.blocks[0]

  return {
    block,
    results: block_calls,
    tokenMetadata: result.tokenMetadata,
  } as unknown as simulateCalls.ReturnType<calls>
}

export declare namespace simulateCalls {
  export type Parameters<
    calls extends readonly unknown[] = readonly unknown[],
    account extends Account | Address | undefined =
      | Account
      | Address
      | undefined,
  > = Omit<simulateBlocks.Parameters, 'blocks' | 'returnFullTransactions'> & {
    /** Account attached to the calls (msg.sender). */
    account?: account | undefined
    /** Calls to simulate. */
    calls: Calls<Narrow<calls>>
    /** State overrides. */
    stateOverrides?: StateOverride | undefined
  }

  export type ReturnType<
    calls extends readonly unknown[] = readonly unknown[],
  > = {
    /** Block results. */
    block: Block
    /** Call results. */
    results: MulticallResults<
      Narrow<calls>,
      true,
      {
        extraProperties: {
          data: Hex
          gasUsed: bigint
          logs?: Log[] | undefined
        }
        error: Error
        mutability: AbiStateMutability
      }
    >
    /** Token metadata resolved from the simulation. */
    tokenMetadata: Record<Address, TokenMetadata>
  }

  export type ErrorType = simulateBlocks.ErrorType | ErrorType_
}
