import type { PublicClient } from '../../clients'

import type {
  Address,
  BlockNumber,
  BlockTag,
  ExtractArgsFromEventDefinition,
  Filter,
  LogTopic,
} from '../../types'
import { getEventSignature, numberToHex } from '../../utils'

export type EventFilterArgs<TEventDefinition extends `${string}(${string})`> =
  ExtractArgsFromEventDefinition<TEventDefinition>

export type CreateEventFilterArgs<
  TEventDefinition extends `${string}(${string})`,
> = {
  address?: Address | Address[]
  fromBlock?: BlockNumber | BlockTag
  toBlock?: BlockNumber | BlockTag
} & (
  | {
      event: TEventDefinition
      args?: EventFilterArgs<TEventDefinition>
    }
  | {
      event?: never
      args?: never
    }
)
export type CreateEventFilterResponse = Filter<'event'>

export async function createEventFilter<
  TEventDefinition extends `${string}(${string})`,
>(
  client: PublicClient,
  {
    address,
    event,
    args,
    fromBlock,
    toBlock,
  }: CreateEventFilterArgs<TEventDefinition> = {},
): Promise<CreateEventFilterResponse> {
  let topics: LogTopic[] = []
  if (event) {
    topics = buildFilterTopics({ event, args })
  }
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
  return { id, type: 'event' }
}

export function buildFilterTopics<
  TEventDefinition extends `${string}(${string})`,
>({
  event,
  args: _args,
}: {
  event: TEventDefinition
  args?: EventFilterArgs<TEventDefinition>
}) {
  const signature = getEventSignature(event)

  // TODO: support args

  return [signature]
}
