import type { Abi, AbiStateMutability, Address, Narrow } from 'abitype'
import * as BlockOverrides from 'ox/BlockOverrides'

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
import type { Account } from '../../accounts/types.js'

/** TIP-20 token metadata returned by `tempo_simulateV1`. */
export type Tip20TokenMetadata = {
  /** Token name. */
  name: string
  /** Token symbol. */
  symbol: string
  /** Token decimals (always 6 for TIP-20). */
  decimals: number
  /** Currency denomination (e.g. "USD"). */
  currency: string
}

type CallExtraProperties = ExactPartial<
  UnionOmit<
    TransactionRequest,
    'blobs' | 'data' | 'kzg' | 'to' | 'sidecars' | 'value'
  >
> & {
  account?: Account | Address | undefined
  to?: Address | null | undefined
}

export declare namespace simulateBlocks {
  export type Parameters<
    calls extends readonly unknown[] = readonly unknown[],
  > = {
    blocks: readonly {
      blockOverrides?: BlockOverrides.BlockOverrides | undefined
      calls: Calls<Narrow<calls>, CallExtraProperties>
      stateOverrides?: StateOverride | undefined
    }[]
    returnFullTransactions?: boolean | undefined
    traceTransfers?: boolean | undefined
    validation?: boolean | undefined
  } & (
    | {
        blockNumber?: bigint | undefined
        blockTag?: undefined
      }
    | {
        blockNumber?: undefined
        blockTag?: BlockTag | undefined
      }
  )

  export type ReturnType<
    calls extends readonly unknown[] = readonly unknown[],
  > = readonly (Block & {
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
  })[] & {
    /** TIP-20 token metadata for addresses that appear in Transfer logs. */
    tokenMetadata: Record<Address, Tip20TokenMetadata>
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
    | import('../../errors/utils.js').ErrorType
}

/**
 * Simulates a set of calls with TIP-20 token metadata enrichment.
 *
 * Uses `tempo_simulateV1` which extends `eth_simulateV1` by returning
 * TIP-20 token metadata (name, symbol, decimals, currency) for all
 * tokens involved in Transfer events — one roundtrip instead of two.
 *
 * @example
 * ```ts
 * import { createClient, http } from 'viem'
 * import { tempo } from 'viem/chains'
 * import { tempoActions } from 'viem/tempo'
 *
 * const client = createClient({
 *   chain: tempo(),
 *   transport: http(),
 * }).extend(tempoActions())
 *
 * const result = await client.simulateBlocks({
 *   blocks: [{
 *     calls: [{
 *       to: '0x20c0000000000000000000000000000000000001',
 *       data: '0x...',
 *     }],
 *   }],
 *   traceTransfers: true,
 * })
 *
 * result.tokenMetadata
 * // => { '0x20c0...': { name: 'Path USD', symbol: 'pUSD', decimals: 6, currency: 'USD' } }
 * ```
 *
 * @param client - Client to use.
 * @param parameters - {@link simulateBlocks.Parameters}
 * @returns Simulated blocks with token metadata. {@link simulateBlocks.ReturnType}
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
        const account = call.account ? parseAccount(call.account) : undefined
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

    const result = await client.request<{
      Method: 'tempo_simulateV1'
      Parameters: [
        {
          blockStateCalls: typeof blockStateCalls
          returnFullTransactions?: boolean | undefined
          traceTransfers?: boolean | undefined
          validation?: boolean | undefined
        },
        string,
      ]
      ReturnType: {
        blocks: readonly (Block & {
          calls: readonly {
            error?:
              | {
                  data?: Hex | undefined
                  code: number
                  message: string
                }
              | undefined
            logs?: readonly Log[] | undefined
            gasUsed: Hex
            returnData: Hex
            status: Hex
          }[]
        })[]
        tokenMetadata: Record<Address, Tip20TokenMetadata>
      }
    }>({
      method: 'tempo_simulateV1',
      params: [
        { blockStateCalls, returnFullTransactions, traceTransfers, validation },
        block,
      ],
    })

    const formattedBlocks = result.blocks.map((block, i) => ({
      ...formatBlock(block as never),
      calls: block.calls.map((call, j) => {
        const { abi, args, functionName, to } = blocks[i].calls[j] as Call<
          unknown,
          CallExtraProperties
        >

        const data = call.error?.data ?? call.returnData
        const gasUsed = BigInt(call.gasUsed)
        const logs = call.logs?.map((log) => formatLog(log as never))
        const status = call.status === '0x1' ? 'success' : 'failure'

        const decodedResult =
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
                result: decodedResult,
              }
            : {
                error,
              }),
        }
      }),
    }))

    return Object.assign(formattedBlocks, {
      tokenMetadata: result.tokenMetadata ?? {},
    }) as unknown as simulateBlocks.ReturnType<calls>
  } catch (e) {
    const cause = e as BaseError
    const error = getNodeError(cause, {})
    if (error instanceof UnknownNodeError) throw cause
    throw error
  }
}
