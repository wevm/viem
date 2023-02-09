import { Abi } from 'abitype'
import type { PublicClient } from '../../clients'

import type {
  Address,
  BlockNumber,
  BlockTag,
  EventDefinition,
  ExtractArgsFromEventDefinition,
  Filter,
  LogTopic,
} from '../../types'
import {
  EncodeEventTopicsArgs,
  encodeEventTopics,
  extractFunctionName,
  extractFunctionParams,
  numberToHex,
  getAbiItem,
} from '../../utils'

export type EventFilterArgs<TEventDefinition extends EventDefinition> =
  ExtractArgsFromEventDefinition<TEventDefinition>

export type CreateEventFilterArgs<TEventDefinition extends EventDefinition> = {
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
  TEventDefinition extends EventDefinition,
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
  if (event) topics = buildFilterTopics({ event, args })
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

export function buildFilterTopics<TEventDefinition extends EventDefinition>({
  event,
  args,
}: {
  event: TEventDefinition
  args?: EventFilterArgs<TEventDefinition>
}) {
  const eventName = extractFunctionName(event)!
  const abi = unstable_parseAbi(event)
  return encodeEventTopics({ abi, eventName, args } as EncodeEventTopicsArgs)
}

// REFACTOR: Implement a full version of `parseAbi` that supports more types (functions, errors) & more complex arg types (structs & arrays).
function unstable_parseAbi(definition: EventDefinition): Abi {
  const name = extractFunctionName(definition)!
  const params = extractFunctionParams(definition)
  return [
    {
      type: 'event',
      name,
      inputs: params || [],
    },
  ]
}
