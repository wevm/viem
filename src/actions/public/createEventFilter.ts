import { Abi, AbiEvent } from 'abitype'
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
  EncodeEventTopicsArgs,
  encodeEventTopics,
  numberToHex,
} from '../../utils'

export type CreateEventFilterArgs<
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

export type CreateEventFilterResponse<
  TAbiEvent extends AbiEvent | undefined = undefined,
  TAbi extends Abi | readonly unknown[] = [TAbiEvent],
  TEventName extends string | undefined = MaybeAbiEventName<TAbiEvent>,
  TArgs extends
    | MaybeExtractEventArgsFromAbi<TAbi, TEventName>
    | undefined = undefined,
> = Filter<'event', TAbi, TEventName, TArgs>

export async function createEventFilter<
  TAbiEvent extends AbiEvent | undefined,
  TAbi extends Abi | readonly unknown[],
  TEventName extends string | undefined,
  TArgs extends MaybeExtractEventArgsFromAbi<TAbi, TEventName> | undefined,
>(
  client: PublicClient,
  {
    address,
    args,
    event,
    fromBlock,
    toBlock,
  }: CreateEventFilterArgs<TAbiEvent, TAbi, TEventName, TArgs> = {} as any,
): Promise<CreateEventFilterResponse<TAbiEvent, TAbi, TEventName, TArgs>> {
  let topics: LogTopic[] = []
  if (event)
    topics = encodeEventTopics({
      abi: [event],
      eventName: event.name,
      args,
    } as EncodeEventTopicsArgs)

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
  } as unknown as CreateEventFilterResponse<TAbiEvent, TAbi, TEventName, TArgs>
}
