import type { Abi, AbiEvent } from 'abitype'
import type { PublicClient } from '../../clients'

import type {
  Address,
  BlockNumber,
  BlockTag,
  Filter,
  LogTopic,
  MaybeAbiEventName,
  MaybeExtractEventArgsFromAbi,
} from '../../types'
import {
  encodeEventTopics,
  EncodeEventTopicsParameters,
  numberToHex,
} from '../../utils'

export type CreateEventFilterParameters<
  TAbiEvent extends AbiEvent | undefined = undefined,
  TAbi extends Abi | readonly unknown[] = [TAbiEvent],
  TEventName extends string | undefined = MaybeAbiEventName<TAbiEvent>,
  TArgs extends
    | MaybeExtractEventArgsFromAbi<TAbi, TEventName>
    | undefined = undefined,
> = {
  address?: Address | Address[]
  fromBlock?: BlockNumber | BlockTag
  toBlock?: BlockNumber | BlockTag
} & (MaybeExtractEventArgsFromAbi<
  TAbi,
  TEventName
> extends infer TEventFilterArgs
  ?
      | {
          args:
            | TEventFilterArgs
            | (TArgs extends TEventFilterArgs ? TArgs : never)
          event: TAbiEvent
        }
      | {
          args?: never
          event?: TAbiEvent
        }
      | {
          args?: never
          event?: never
        }
  : {
      args?: never
      event?: never
    })

export type CreateEventFilterReturnType<
  TAbiEvent extends AbiEvent | undefined = undefined,
  TAbi extends Abi | readonly unknown[] = [TAbiEvent],
  TEventName extends string | undefined = MaybeAbiEventName<TAbiEvent>,
  TArgs extends
    | MaybeExtractEventArgsFromAbi<TAbi, TEventName>
    | undefined = undefined,
> = Filter<'event', TAbi, TEventName, TArgs>

/**
 * Creates a Filter to retrieve event logs that can be used with [`getFilterChanges`](https://viem.sh/docs/actions/public/getFilterChanges.html) or [`getFilterLogs`](https://viem.sh/docs/actions/public/getFilterLogs.html).
 */
export async function createEventFilter<
  TAbiEvent extends AbiEvent | undefined,
  TAbi extends Abi | readonly unknown[] = [TAbiEvent],
  TEventName extends string | undefined = MaybeAbiEventName<TAbiEvent>,
  TArgs extends
    | MaybeExtractEventArgsFromAbi<TAbi, TEventName>
    | undefined = undefined,
>(
  client: PublicClient,
  {
    address,
    args,
    event,
    fromBlock,
    toBlock,
  }: CreateEventFilterParameters<
    TAbiEvent,
    TAbi,
    TEventName,
    TArgs
  > = {} as any,
): Promise<CreateEventFilterReturnType<TAbiEvent, TAbi, TEventName, TArgs>> {
  let topics: LogTopic[] = []
  if (event)
    topics = encodeEventTopics({
      abi: [event],
      eventName: event.name,
      args,
    } as EncodeEventTopicsParameters)

  const id = await client.request({
    method: 'eth_newFilter',
    params: [
      {
        address,
        fromBlock:
          typeof fromBlock === 'bigint' ? numberToHex(fromBlock) : fromBlock,
        toBlock: typeof toBlock === 'bigint' ? numberToHex(toBlock) : toBlock,
        ...(topics.length ? { topics } : {}),
      },
    ],
  })
  return {
    abi: event ? [event] : undefined,
    args,
    eventName: event ? event.name : undefined,
    id,
    type: 'event',
  } as unknown as CreateEventFilterReturnType<
    TAbiEvent,
    TAbi,
    TEventName,
    TArgs
  >
}
