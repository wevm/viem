import type { AbiEvent, Address, Block, Errors } from 'ox'

import type * as Client from '../../Client.js'
import { BaseError } from '../../Errors.js'
import type { OneOf } from '../../internal/types.js'
import { get } from '../block/get.js'
import { getLogs } from './getLogs.js'
import * as internal from './internal.js'

/**
 * Iterates over the event logs in a block range, one page of blocks at a time
 * (`eth_getLogs`).
 *
 * Pages are contiguous and are yielded even when they contain no logs, so a
 * consumer that stores each page's `toBlock` can resume from `toBlock + 1n`. A
 * page is only requested once the consumer asks for it. If a request fails
 * with an error that a smaller block range may avoid (such as an RPC
 * Provider's block range or response size limit), the page is halved and
 * requested again.
 *
 * @example
 * ```ts
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { AbiEvent } from 'viem/utils'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * for await (const page of Actions.event.iterateLogs(client, {
 *   event: AbiEvent.from(
 *     'event Transfer(address indexed from, address indexed to, uint256 value)',
 *   ),
 *   fromBlock: 16330000n,
 *   toBlock: 16340000n,
 * }))
 *   console.log(page.toBlock, page.logs)
 * ```
 *
 * @param client - Client to use.
 * @param options - Options.
 * @returns An async iterator of log pages.
 */
export async function* iterateLogs<
  const abiEvent extends
    | AbiEvent.AbiEvent
    | readonly AbiEvent.AbiEvent[]
    | undefined = undefined,
  strict extends boolean | undefined = undefined,
>(
  client: Client.Client,
  options: iterateLogs.Options<abiEvent, strict>,
): iterateLogs.ReturnType<abiEvent, strict> {
  const {
    address,
    args,
    blockRange = 1_000n,
    event,
    events,
    fromBlock,
    strict,
    toBlock = 'latest',
  } = options as iterateLogs.Options

  // A range of less than one block never moves past `fromBlock`.
  if (blockRange < 1n) throw new InvalidBlockRangeError({ blockRange })

  // Resolve a block tag once, so the iteration has a fixed end.
  const endBlock =
    typeof toBlock === 'bigint'
      ? toBlock
      : (await get(client, { blockTag: toBlock })).number

  // `size` is the most blocks to request at once. It halves when a request
  // fails and doubles back up to `blockRange` after each page.
  let size = blockRange
  let from = fromBlock
  while (from <= endBlock) {
    const end = from + size - 1n
    const to = end < endBlock ? end : endBlock

    const logs = await getLogs(client, {
      address,
      args,
      event,
      events,
      fromBlock: from,
      strict,
      toBlock: to,
    } as getLogs.Options).catch((error) => {
      // A single block cannot be split, and a smaller range does not help
      // when the RPC Provider is unreachable or rejects the client.
      if (from === to || !internal.isRangeError(error)) throw error
      return undefined
    })
    if (!logs) {
      size = (to - from + 1n) / 2n
      continue
    }

    yield {
      endBlock,
      fromBlock: from,
      logs: logs as getLogs.ReturnType<abiEvent, strict>,
      toBlock: to,
    }
    from = to + 1n
    size = size * 2n < blockRange ? size * 2n : blockRange
  }
}

export declare namespace iterateLogs {
  type Options<
    abiEvent extends
      | AbiEvent.AbiEvent
      | readonly AbiEvent.AbiEvent[]
      | undefined = undefined,
    strict extends boolean | undefined = undefined,
  > = {
    /** Address or list of addresses from which logs originated. */
    address?: Address.Address | readonly Address.Address[] | undefined
    /**
     * Most blocks to request in one `eth_getLogs` call. Must be at least `1n`.
     *
     * @default 1_000n
     */
    blockRange?: bigint | undefined
    /** First block to include logs from. Inclusive. */
    fromBlock: Block.Number
    /**
     * Last block to include logs from. Inclusive. A block tag is resolved to a
     * block number once, before the first page.
     *
     * @default 'latest'
     */
    toBlock?: Block.Number | Exclude<Block.Tag, 'pending'> | undefined
  } & OneOf<
    | {
        /** Event to filter and decode logs by. */
        event: abiEvent extends readonly AbiEvent.AbiEvent[] ? never : abiEvent
        /** Indexed argument values to filter logs by. */
        args?:
          | getLogs.EventArgs<
              abiEvent extends AbiEvent.AbiEvent ? abiEvent : undefined
            >
          | undefined
        /**
         * Whether the logs must match the indexed/non-indexed arguments on
         * `event`.
         *
         * @default false
         */
        strict?: strict | boolean | undefined
      }
    | {
        /** Events to filter and decode logs by. */
        events: abiEvent extends AbiEvent.AbiEvent ? never : abiEvent
        /**
         * Whether the logs must match the indexed/non-indexed arguments on
         * `events`.
         *
         * @default false
         */
        strict?: strict | boolean | undefined
      }
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    | {}
  >

  type ReturnType<
    abiEvent extends
      | AbiEvent.AbiEvent
      | readonly AbiEvent.AbiEvent[]
      | undefined = undefined,
    strict extends boolean | undefined = undefined,
  > = AsyncGenerator<
    {
      /**
       * Last block of the whole iteration: `toBlock`, or the block number its
       * tag resolved to.
       */
      endBlock: Block.Number
      /** First block of the page. */
      fromBlock: Block.Number
      /** Logs from `fromBlock` to `toBlock`. */
      logs: getLogs.ReturnType<abiEvent, strict>
      /** Last block of the page. A resumed iteration starts at `toBlock + 1n`. */
      toBlock: Block.Number
    },
    void,
    undefined
  >

  type ErrorType =
    | InvalidBlockRangeError
    | get.ErrorType
    | getLogs.ErrorType
    | Errors.GlobalErrorType
}

/** Thrown when `blockRange` is less than `1n`. */
export class InvalidBlockRangeError extends BaseError {
  override readonly name = 'Event.InvalidBlockRangeError'

  constructor(options: { blockRange: bigint }) {
    super(
      `\`blockRange\` must be at least 1n. Received ${options.blockRange}n.`,
    )
  }
}
