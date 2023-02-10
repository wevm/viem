import { Abi } from 'abitype'
import type { PublicClient } from '../../clients'

import type {
  Address,
  BlockNumber,
  BlockTag,
  EventDefinition,
  EventFilterArgs,
  Filter,
  LogTopic,
} from '../../types'
import {
  EncodeEventTopicsArgs,
  encodeEventTopics,
  extractFunctionName,
  extractFunctionParams,
  numberToHex,
} from '../../utils'

export type CreateEventFilterArgs<
  TEventDefinition extends EventDefinition | undefined,
  TArgs extends
    | EventFilterArgs<TEventDefinition>
    | undefined = EventFilterArgs<TEventDefinition>,
> = {
  address?: Address | Address[]
  fromBlock?: BlockNumber | BlockTag
  toBlock?: BlockNumber | BlockTag
} & (
  | {
      args?: TArgs
      event: TEventDefinition
    }
  | {
      args?: never
      event?: never
    }
)
export type CreateEventFilterResponse<
  TEventDefinition extends EventDefinition | undefined = undefined,
  TArgs extends EventFilterArgs<TEventDefinition> | undefined = undefined,
> = Filter<'event', TEventDefinition, TArgs>

export async function createEventFilter<
  TEventDefinition extends EventDefinition | undefined = undefined,
  TArgs extends EventFilterArgs<TEventDefinition> | undefined = undefined,
>(
  client: PublicClient,
  {
    address,
    args,
    event,
    fromBlock,
    toBlock,
  }: CreateEventFilterArgs<TEventDefinition, TArgs> = {},
): Promise<CreateEventFilterResponse<TEventDefinition, TArgs>> {
  let topics: LogTopic[] = []
  if (event)
    topics = buildFilterTopics({ event, args } as BuildFilterTopicsArgs)
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
    args,
    event,
    id,
    type: 'event',
  } as unknown as CreateEventFilterResponse<TEventDefinition, TArgs>
}

export type BuildFilterTopicsArgs<
  TEventDefinition extends EventDefinition = EventDefinition,
> = {
  args?: EventFilterArgs<TEventDefinition>
  event: TEventDefinition
}
export function buildFilterTopics<TEventDefinition extends EventDefinition>({
  args,
  event,
}: BuildFilterTopicsArgs<TEventDefinition>) {
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
