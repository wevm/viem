import * as AbiEvent from 'ox/AbiEvent'
import type * as Block from 'ox/Block'
import type * as Errors from 'ox/Errors'
import type * as Hex from 'ox/Hex'
import { z } from 'ox/zod'

import type * as Client from '../../Client.js'
import type * as event from '../event/index.js'
import type { Filter, Type } from './Filter.js'

/**
 * Returns the changes for a filter since it was created or last polled
 * (`eth_getFilterChanges`).
 *
 * - `block` / `transaction` filters return a list of hashes.
 * - `event` filters return a list of decoded logs (raw logs when the filter was
 *   created without an event).
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
 * // `filter` is returned from a `create*Filter` action.
 * const changes = await Actions.filter.getChanges(client, { filter })
 * ```
 */
export async function getChanges<
  type extends Type = Type,
  const abiEvent extends
    | AbiEvent.AbiEvent
    | readonly AbiEvent.AbiEvent[]
    | undefined = undefined,
  strict extends boolean | undefined = undefined,
  fromBlock extends Block.Number | Block.Tag | undefined = undefined,
  toBlock extends Block.Number | Block.Tag | undefined = undefined,
>(
  _client: Client.Client,
  options: getChanges.Options<type, abiEvent, strict, fromBlock, toBlock>,
): Promise<getChanges.ReturnType<type, abiEvent, strict, fromBlock, toBlock>> {
  const { filter } = options as getChanges.Options
  const result = await filter.request({
    method: 'eth_getFilterChanges',
    params: [filter.id],
  })

  // `block` / `transaction` filters return hashes.
  if (typeof result[0] === 'string') return result as never

  const item = z.RpcSchema.parseItem(z.RpcSchema.Eth, 'eth_getFilterChanges')
  const logs = z.RpcSchema.decodeReturns(item, [...result] as never)

  const events = (() => {
    const abiEvent = 'abiEvent' in filter ? filter.abiEvent : undefined
    if (!abiEvent) return undefined
    return Array.isArray(abiEvent) ? abiEvent : [abiEvent]
  })()
  if (!events) return logs as never

  return AbiEvent.extractLogs(events, logs as never, {
    args: 'args' in filter ? filter.args : undefined,
    strict: ('strict' in filter ? filter.strict : undefined) ?? false,
  })
}

export declare namespace getChanges {
  type Options<
    type extends Type = Type,
    abiEvent extends
      | AbiEvent.AbiEvent
      | readonly AbiEvent.AbiEvent[]
      | undefined = undefined,
    strict extends boolean | undefined = undefined,
    fromBlock extends Block.Number | Block.Tag | undefined = undefined,
    toBlock extends Block.Number | Block.Tag | undefined = undefined,
  > = {
    /** Filter to fetch changes for. */
    filter: Filter<type, abiEvent, strict, fromBlock, toBlock>
  }

  type ReturnType<
    type extends Type = Type,
    abiEvent extends
      | AbiEvent.AbiEvent
      | readonly AbiEvent.AbiEvent[]
      | undefined = undefined,
    strict extends boolean | undefined = undefined,
    fromBlock extends Block.Number | Block.Tag | undefined = undefined,
    toBlock extends Block.Number | Block.Tag | undefined = undefined,
  > = type extends 'event'
    ? event.getLogs.ReturnType<abiEvent, strict, fromBlock, toBlock>
    : readonly Hex.Hex[]

  type ErrorType = AbiEvent.extractLogs.ErrorType | Errors.GlobalErrorType
}
