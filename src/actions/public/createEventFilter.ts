import type { Abi, AbiEvent, Narrow } from 'abitype'
import type { PublicClient, Transport } from '../../clients/index.js'

import type {
  Address,
  BlockNumber,
  BlockTag,
  Chain,
  Filter,
  LogTopic,
  MaybeAbiEventName,
  MaybeExtractEventArgsFromAbi,
  Prettify,
} from '../../types/index.js'
import { encodeEventTopics, numberToHex } from '../../utils/index.js'
import type { EncodeEventTopicsParameters } from '../../utils/index.js'

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
          event: Narrow<TAbiEvent>
        }
      | {
          args?: never
          event?: Narrow<TAbiEvent>
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
> = Prettify<Filter<'event', TAbi, TEventName, TArgs>>

export async function createEventFilter<
  TChain extends Chain | undefined,
  TAbiEvent extends AbiEvent | undefined,
  _Abi extends Abi | readonly unknown[] = [TAbiEvent],
  _EventName extends string | undefined = MaybeAbiEventName<TAbiEvent>,
  _Args extends
    | MaybeExtractEventArgsFromAbi<_Abi, _EventName>
    | undefined = undefined,
>(
  client: PublicClient<Transport, TChain>,
  {
    address,
    args,
    event,
    fromBlock,
    toBlock,
  }: CreateEventFilterParameters<
    TAbiEvent,
    _Abi,
    _EventName,
    _Args
  > = {} as any,
): Promise<CreateEventFilterReturnType<TAbiEvent, _Abi, _EventName, _Args>> {
  let topics: LogTopic[] = []
  if (event)
    topics = encodeEventTopics({
      abi: [event],
      eventName: (event as AbiEvent).name,
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
    eventName: event ? (event as AbiEvent).name : undefined,
    id,
    type: 'event',
  } as unknown as CreateEventFilterReturnType<
    TAbiEvent,
    _Abi,
    _EventName,
    _Args
  >
}
