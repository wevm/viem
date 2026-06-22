import * as AbiEvent from 'ox/AbiEvent'
import type * as Address from 'ox/Address'
import type * as Block from 'ox/Block'
import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'
import type * as Log from 'ox/Log'
import { z } from 'ox/zod'

import type * as Client from '../../Client.js'
import type { OneOf } from '../../internal/types.js'

/**
 * Returns a list of event logs matching the provided parameters (`eth_getLogs`).
 *
 * @example
 * ```ts
 * import { AbiEvent } from 'ox'
 * import { Actions, Client, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = Client.create({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const logs = await Actions.getLogs(client, {
 *   event: AbiEvent.from(
 *     'event Transfer(address indexed from, address indexed to, uint256 value)',
 *   ),
 * })
 * ```
 */
export async function getLogs<
  const abiEvent extends
    | AbiEvent.AbiEvent
    | readonly AbiEvent.AbiEvent[]
    | undefined = undefined,
  strict extends boolean | undefined = undefined,
  fromBlock extends Block.Number | Block.Tag | undefined = undefined,
  toBlock extends Block.Number | Block.Tag | undefined = undefined,
>(
  client: Client.Client,
  options: getLogs.Options<abiEvent, strict, fromBlock, toBlock> = {},
): Promise<getLogs.ReturnType<abiEvent, strict, fromBlock, toBlock>> {
  const {
    address,
    blockHash,
    fromBlock,
    toBlock,
    event,
    events: events_,
    args,
    strict = false,
  } = options as getLogs.Options

  const events = events_ ?? (event ? [event] : undefined)

  const topics = (() => {
    if (!events) return undefined
    if (event)
      return AbiEvent.encode(
        event,
        ...((args !== undefined ? [args] : []) as []),
      ).topics
    return [events.map((event) => AbiEvent.encode(event).topics[0])]
  })() as readonly Hex.Hex[]

  const item = z.RpcSchema.parseItem(z.RpcSchema.Eth, 'eth_getLogs')
  const result = await client.request({
    method: 'eth_getLogs',
    params: z.RpcSchema.encodeParams(item, [
      blockHash
        ? { address, blockHash, topics }
        : { address, fromBlock, toBlock, topics },
    ]),
  })
  const logs = z.RpcSchema.decodeReturns(item, [...result])

  if (!events) return logs as never
  return AbiEvent.extractLogs(events, logs, { args, strict }) as never
}

export declare namespace getLogs {
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
  } & OneOf<
    | {
        /** Event to filter and decode logs by. */
        event: abiEvent extends readonly AbiEvent.AbiEvent[] ? never : abiEvent
        /** Indexed argument values to filter logs by. */
        args?:
          | EventArgs<abiEvent extends AbiEvent.AbiEvent ? abiEvent : undefined>
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
  > &
    OneOf<
      | {
          /** Block number or tag after which to include logs. */
          fromBlock?: fromBlock | Block.Number | Block.Tag | undefined
          /** Block number or tag before which to include logs. */
          toBlock?: toBlock | Block.Number | Block.Tag | undefined
        }
      | {
          /** Hash of the block to include logs from. */
          blockHash?: Hex.Hex | undefined
        }
    >

  type ReturnType<
    abiEvent extends
      | AbiEvent.AbiEvent
      | readonly AbiEvent.AbiEvent[]
      | undefined = undefined,
    strict extends boolean | undefined = undefined,
    fromBlock extends Block.Number | Block.Tag | undefined = undefined,
    toBlock extends Block.Number | Block.Tag | undefined = undefined,
    _pending extends boolean =
      | (fromBlock extends 'pending' ? true : false)
      | (toBlock extends 'pending' ? true : false),
  > = readonly (abiEvent extends AbiEvent.AbiEvent
    ? AbiEvent.extractLogs.ReturnType<abiEvent, Log.Log<_pending>, strict>
    : abiEvent extends readonly AbiEvent.AbiEvent[]
      ? {
          [key in keyof abiEvent]: AbiEvent.extractLogs.ReturnType<
            abiEvent[key] & AbiEvent.AbiEvent,
            Log.Log<_pending>,
            strict
          >
        }[number]
      : Log.Log<_pending>)[]

  type EventArgs<abiEvent extends AbiEvent.AbiEvent | undefined> =
    abiEvent extends AbiEvent.AbiEvent
      ? FirstArg<AbiEvent.encode.Args<abiEvent>>
      : undefined

  type FirstArg<args> = args extends readonly [infer arg] ? arg : never

  type ErrorType =
    | AbiEvent.encode.ErrorType
    | AbiEvent.extractLogs.ErrorType
    | Errors.GlobalErrorType
}
