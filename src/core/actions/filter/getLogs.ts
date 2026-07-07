import * as AbiEvent from 'ox/AbiEvent'
import type * as Block from 'ox/Block'
import type * as Errors from 'ox/Errors'
import { z } from 'ox/zod'

import type * as Client from '../../Client.js'
import type * as event from '../event/index.js'
import type { Filter } from './Filter.js'

/**
 * Returns the list of logs matching an `event` filter, regardless of when it
 * was created or last polled (`eth_getFilterLogs`).
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
 * // `filter` is returned from `event.createFilter` / `contract.createEventFilter`.
 * const logs = await Actions.filter.getLogs(client, { filter })
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
  _client: Client.Client,
  options: getLogs.Options<abiEvent, strict, fromBlock, toBlock>,
): Promise<getLogs.ReturnType<abiEvent, strict, fromBlock, toBlock>> {
  const { filter } = options as getLogs.Options
  const result = await filter.request({
    method: 'eth_getFilterLogs',
    params: [filter.id],
  })

  const item = z.RpcSchema.parseItem(z.RpcSchema.Eth, 'eth_getFilterLogs')
  const logs = z.RpcSchema.decodeReturns(item, [...result])

  const events = (() => {
    const { abiEvent } = filter
    if (!abiEvent) return undefined
    return Array.isArray(abiEvent) ? abiEvent : [abiEvent]
  })()
  if (!events) return logs as never

  return AbiEvent.extractLogs(events, logs as never, {
    args: filter.args,
    strict: filter.strict ?? false,
  })
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
    /** Event filter to fetch logs for. */
    filter: Filter<'event', abiEvent, strict, fromBlock, toBlock>
  }

  type ReturnType<
    abiEvent extends
      | AbiEvent.AbiEvent
      | readonly AbiEvent.AbiEvent[]
      | undefined = undefined,
    strict extends boolean | undefined = undefined,
    fromBlock extends Block.Number | Block.Tag | undefined = undefined,
    toBlock extends Block.Number | Block.Tag | undefined = undefined,
  > = event.getLogs.ReturnType<abiEvent, strict, fromBlock, toBlock>

  type ErrorType = AbiEvent.extractLogs.ErrorType | Errors.GlobalErrorType
}
