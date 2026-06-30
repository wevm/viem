import * as AbiEvent from 'ox/AbiEvent'
import type * as Address from 'ox/Address'
import type * as Block from 'ox/Block'
import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'
import { z } from 'ox/zod'

import type * as Client from '../../Client.js'
import type { OneOf } from '../../internal/types.js'
import type { Filter } from '../filter/Filter.js'
import { requestScope } from '../filter/internal/requestScope.js'
import type { getLogs } from './getLogs.js'

/**
 * Creates a filter to listen for new event logs (`eth_newFilter`).
 *
 * The returned filter can be polled with {@link Actions.filter.getChanges} (or
 * fully re-read with {@link Actions.filter.getLogs}) and torn down with
 * {@link Actions.filter.uninstall}. Matched logs are decoded against the
 * `event`(s) the filter was created with.
 *
 * @example
 * ```ts
 * import * as AbiEvent from 'ox/AbiEvent'
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const filter = await Actions.event.createFilter(client, {
 *   event: AbiEvent.from(
 *     'event Transfer(address indexed from, address indexed to, uint256 value)',
 *   ),
 * })
 * const logs = await Actions.filter.getChanges(client, { filter })
 * ```
 */
export async function createFilter<
  const abiEvent extends
    | AbiEvent.AbiEvent
    | readonly AbiEvent.AbiEvent[]
    | undefined = undefined,
  strict extends boolean | undefined = undefined,
  fromBlock extends Block.Number | Block.Tag | undefined = undefined,
  toBlock extends Block.Number | Block.Tag | undefined = undefined,
>(
  client: Client.Client,
  options: createFilter.Options<abiEvent, strict, fromBlock, toBlock> = {},
): Promise<createFilter.ReturnType<abiEvent, strict, fromBlock, toBlock>> {
  const {
    address,
    fromBlock,
    toBlock,
    event,
    events: events_,
    args,
    strict = false,
  } = options as createFilter.Options

  const events = events_ ?? (event ? [event] : undefined)

  const topics = (() => {
    if (!events) return undefined
    if (event)
      return AbiEvent.encode(
        event,
        ...((args !== undefined ? [args] : []) as []),
      ).topics
    return [events.map((event) => AbiEvent.encode(event).topics[0])]
  })() as readonly Hex.Hex[] | undefined

  const getRequest = requestScope(client, { method: 'eth_newFilter' })
  const item = z.RpcSchema.parseItem(z.RpcSchema.Eth, 'eth_newFilter')
  const id = await client.request({
    method: 'eth_newFilter',
    params: z.RpcSchema.encodeParams(item, [
      { address, fromBlock, toBlock, ...(topics ? { topics } : {}) },
    ]),
  })

  return {
    id,
    request: getRequest(id),
    type: 'event',
    abiEvent: events,
    args,
    strict,
    fromBlock,
    toBlock,
  } as never
}

export declare namespace createFilter {
  type Options<
    abiEvent extends
      | AbiEvent.AbiEvent
      | readonly AbiEvent.AbiEvent[]
      | undefined = undefined,
    strict extends boolean | undefined = undefined,
    fromBlock extends Block.Number | Block.Tag | undefined = undefined,
    toBlock extends Block.Number | Block.Tag | undefined = undefined,
  > = {
    /** Address or list of addresses from which logs originated. */
    address?: Address.Address | readonly Address.Address[] | undefined
    /** Block number or tag after which to include logs. */
    fromBlock?: fromBlock | Block.Number | Block.Tag | undefined
    /** Block number or tag before which to include logs. */
    toBlock?: toBlock | Block.Number | Block.Tag | undefined
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
    fromBlock extends Block.Number | Block.Tag | undefined = undefined,
    toBlock extends Block.Number | Block.Tag | undefined = undefined,
  > = Filter<'event', abiEvent, strict, fromBlock, toBlock>

  type ErrorType = AbiEvent.encode.ErrorType | Errors.GlobalErrorType
}
