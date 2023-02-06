import { Abi } from 'abitype'
import type { PublicClient } from '../../clients'

import type {
  Address,
  BlockNumber,
  BlockTag,
  EventDefinition,
  ExtractArgsFromEventDefinition,
  ExtractEventArgsFromAbi,
  ExtractEventNameFromAbi,
  Filter,
} from '../../types'
import {
  encodeEventTopics,
  EncodeEventTopicsArgs,
  numberToHex,
} from '../../utils'

export type EventFilterArgs<TEventDefinition extends EventDefinition> =
  ExtractArgsFromEventDefinition<TEventDefinition>

export type CreateContractEventFilterArgs<
  TAbi extends Abi | readonly unknown[] = Abi,
  TEventName extends string = any,
> = {
  address?: Address | Address[]
  abi: TAbi
  eventName: ExtractEventNameFromAbi<TAbi, TEventName>
  fromBlock?: BlockNumber | BlockTag
  toBlock?: BlockNumber | BlockTag
} & ExtractEventArgsFromAbi<TAbi, TEventName>
export type CreateContractEventFilterResponse = Filter<'event'>

export async function createContractEventFilter<
  TAbi extends Abi | readonly unknown[] = Abi,
  TEventName extends string = any,
>(
  client: PublicClient,
  {
    address,
    abi,
    args,
    eventName,
    fromBlock,
    toBlock,
  }: CreateContractEventFilterArgs<TAbi, TEventName>,
): Promise<CreateContractEventFilterResponse> {
  const topics = eventName
    ? encodeEventTopics({
        abi,
        args,
        eventName,
      } as unknown as EncodeEventTopicsArgs)
    : undefined
  const id = await client.request({
    method: 'eth_newFilter',
    params: [
      {
        address,
        fromBlock:
          typeof fromBlock === 'bigint' ? numberToHex(fromBlock) : fromBlock,
        toBlock: typeof toBlock === 'bigint' ? numberToHex(toBlock) : toBlock,
        topics,
      },
    ],
  })
  return { id, type: 'event' }
}
