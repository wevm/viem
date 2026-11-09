import type { AbiEvent, Address } from 'abitype'

import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { BaseError } from '../../errors/base.js'
import type { ErrorType } from '../../errors/utils.js'
import type { BlockTag } from '../../types/block.js'
import type { Chain } from '../../types/chain.js'
import type {
  MaybeAbiEventName,
  MaybeExtractEventArgsFromAbi,
} from '../../types/contract.js'
import { getAction } from '../../utils/getAction.js'
import { type GetBlockErrorType, getBlock } from './getBlock.js'
import {
  type GetLogsErrorType,
  type GetLogsParameters,
  type GetLogsReturnType,
  getLogs,
} from './getLogs.js'
import { isRangeError } from './internal/isRangeError.js'

export type IterateLogsParameters<
  abiEvent extends AbiEvent | undefined = undefined,
  abiEvents extends
    | readonly AbiEvent[]
    | readonly unknown[]
    | undefined = abiEvent extends AbiEvent ? [abiEvent] : undefined,
  strict extends boolean | undefined = undefined,
  //
  _eventName extends string | undefined = MaybeAbiEventName<abiEvent>,
> = {
  /** Address or list of addresses from which logs originated */
  address?: Address | Address[] | undefined
  /**
   * Most blocks to request in one `eth_getLogs` call. Must be at least `1n`.
   * @default 1_000n
   */
  blockRange?: bigint | undefined
  /** First block to include. Inclusive. */
  fromBlock: bigint
  /**
   * Last block to include. Inclusive. A block tag is resolved to a block number once, before the first page.
   * @default 'latest'
   */
  toBlock?: bigint | Exclude<BlockTag, 'pending'> | undefined
} & (
  | {
      event: abiEvent
      events?: undefined
      args?: MaybeExtractEventArgsFromAbi<abiEvents, _eventName> | undefined
      /**
       * Whether or not the logs must match the indexed/non-indexed arguments on `event`.
       * @default false
       */
      strict?: strict | undefined
    }
  | {
      event?: undefined
      events: abiEvents
      args?: undefined
      /**
       * Whether or not the logs must match the indexed/non-indexed arguments on `event`.
       * @default false
       */
      strict?: strict | undefined
    }
  | {
      event?: undefined
      events?: undefined
      args?: undefined
      strict?: undefined
    }
)

export type IterateLogsReturnType<
  abiEvent extends AbiEvent | undefined = undefined,
  abiEvents extends
    | readonly AbiEvent[]
    | readonly unknown[]
    | undefined = abiEvent extends AbiEvent ? [abiEvent] : undefined,
  strict extends boolean | undefined = undefined,
> = AsyncGenerator<
  {
    /** Last block of the whole iteration: `toBlock`, or the block number its tag resolved to. */
    endBlock: bigint
    /** First block of the page. */
    fromBlock: bigint
    /** Logs from `fromBlock` to `toBlock`. */
    logs: GetLogsReturnType<abiEvent, abiEvents, strict>
    /** Last block of the page. A resumed iteration starts at `toBlock + 1n`. */
    toBlock: bigint
  },
  void,
  undefined
>

export type IterateLogsErrorType =
  | GetBlockErrorType
  | GetLogsErrorType
  | ErrorType

/**
 * Iterates over the event logs in a block range, one page of blocks at a time.
 *
 * - Docs: https://viem.sh/docs/actions/public/iterateLogs
 * - JSON-RPC Methods: [`eth_getLogs`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getlogs)
 *
 * Pages are contiguous and are yielded even when they contain no logs, so a consumer that
 * stores each page's `toBlock` can resume from `toBlock + 1n`. A page is only requested
 * once the consumer asks for it. If a request fails with an error that a smaller block
 * range may avoid (such as an RPC Provider's block range or response size limit), the page
 * is halved and requested again.
 *
 * @param client - Client to use
 * @param parameters - {@link IterateLogsParameters}
 * @returns An async iterator of log pages. {@link IterateLogsReturnType}
 *
 * @example
 * import { createPublicClient, http, parseAbiItem } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { iterateLogs } from 'viem/actions'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * for await (const page of iterateLogs(client, {
 *   event: parseAbiItem('event Transfer(address indexed, address indexed, uint256)'),
 *   fromBlock: 16330000n,
 *   toBlock: 16340000n,
 * })) {
 *   console.log(page.toBlock, page.logs)
 * }
 */
export async function* iterateLogs<
  chain extends Chain | undefined,
  const abiEvent extends AbiEvent | undefined = undefined,
  const abiEvents extends
    | readonly AbiEvent[]
    | readonly unknown[]
    | undefined = abiEvent extends AbiEvent ? [abiEvent] : undefined,
  strict extends boolean | undefined = undefined,
>(
  client: Client<Transport, chain>,
  parameters: IterateLogsParameters<abiEvent, abiEvents, strict>,
): IterateLogsReturnType<abiEvent, abiEvents, strict> {
  const {
    address,
    args,
    blockRange = 1_000n,
    event,
    events,
    fromBlock,
    strict,
    toBlock = 'latest',
  } = parameters

  // A range of less than one block never moves past `fromBlock`.
  if (blockRange < 1n)
    throw new BaseError(`\`blockRange\` must be at least 1n.`)

  // Resolve a block tag once, so the iteration has a fixed end.
  const endBlock =
    typeof toBlock === 'bigint'
      ? toBlock
      : (await getAction(client, getBlock, 'getBlock')({ blockTag: toBlock }))
          .number

  // `size` is the most blocks to request at once. It halves when a request fails
  // and doubles back up to `blockRange` after each page.
  let size = blockRange
  let from = fromBlock
  while (from <= endBlock) {
    const end = from + size - 1n
    const to = end < endBlock ? end : endBlock

    const logs = await getAction(
      client,
      getLogs,
      'getLogs',
    )({
      address,
      args,
      event,
      events,
      fromBlock: from,
      strict,
      toBlock: to,
    } as GetLogsParameters).catch((error) => {
      // A single block cannot be split, and a smaller range does not
      // help when the RPC Provider is unreachable or rejects the client.
      if (from === to || !isRangeError(error)) throw error
    })
    if (!logs) {
      size = (to - from + 1n) / 2n
      continue
    }

    yield {
      endBlock,
      fromBlock: from,
      logs: logs as GetLogsReturnType<abiEvent, abiEvents, strict>,
      toBlock: to,
    }
    from = to + 1n
    size = size * 2n < blockRange ? size * 2n : blockRange
  }
}
