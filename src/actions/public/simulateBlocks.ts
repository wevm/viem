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
import type { ErrorType } from '../../errors/utils.js'
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

export type SimulateBlocksParameters<
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

export type SimulateBlocksReturnType<
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
})[]

export type SimulateBlocksErrorType =
  | AssertRequestErrorType
  | DecodeFunctionResultErrorType
  | EncodeFunctionDataErrorType
  | FormatBlockErrorType
  | FormatTransactionRequestErrorType
  | GetNodeErrorReturnType
  | ParseAccountErrorType
  | SerializeStateOverrideErrorType
  | NumberToHexErrorType
  | ErrorType

/**
 * Simulates a set of calls on block(s) with optional block and state overrides.
 *
 * @example
 * ```ts
 * import { createClient, http, parseEther } from 'viem'
 * import { simulate } from 'viem/actions'
 * import { mainnet } from 'viem/chains'
 *
 * const client = createClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const result = await simulate(client, {
 *   blocks: [{
 *     blockOverrides: {
 *       number: 69420n,
 *     },
 *     calls: [{
 *       {
 *         account: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
 *         data: '0xdeadbeef',
 *         to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *       },
 *       {
 *         account: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
 *         to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *         value: parseEther('1'),
 *       },
 *     }],
 *     stateOverrides: [{
 *       address: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
 *       balance: parseEther('10'),
 *     }],
 *   }]
 * })
 * ```
 *
 * @param client - Client to use.
 * @param parameters - {@link SimulateBlocksParameters}
 * @returns Simulated blocks. {@link SimulateBlocksReturnType}
 */
export async function simulateBlocks<
  chain extends Chain | undefined,
  const calls extends readonly unknown[],
>(
  client: Client<Transport, chain>,
  parameters: SimulateBlocksParameters<calls>,
): Promise<SimulateBlocksReturnType<calls>> {
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

    const result = await client.request({
      method: 'eth_simulateV1',
      params: [
        { blockStateCalls, returnFullTransactions, traceTransfers, validation },
        block,
      ],
    })

    return result.map((block, i) => ({
      ...formatBlock(block),
      calls: block.calls.map((call, j) => {
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
          if (call.error?.data === '0x') error = new AbiDecodingZeroDataError()
          else if (call.error) error = new RawContractError(call.error)

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
    })) as unknown as SimulateBlocksReturnType<calls>
  } catch (e) {
    const cause = e as BaseError
    const error = getNodeError(cause, {})
    if (error instanceof UnknownNodeError) throw cause
    throw error
  }
}
